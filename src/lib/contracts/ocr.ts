import {
  CONTRACT_FIELD_DEFS,
  normalizeFieldValue,
  type ContractFieldName,
  type ExtractedFieldRecord,
  type FieldConfidence,
} from "@/src/lib/contracts/fields";

export type OcrDocumentInput = {
  type: string;
  mimeType: string;
  bytes: Uint8Array;
  filename?: string;
};

export type OcrExtractionResult = {
  fields: Array<{
    field_name: ContractFieldName;
    value: string | null;
    confidence: FieldConfidence;
    source_document: string;
  }>;
  rawNotes?: string | null;
  provider: "openai" | "none";
};

function isOpenAiConfigured() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

function bytesToDataUrl(bytes: Uint8Array, mimeType: string) {
  const base64 = Buffer.from(bytes).toString("base64");
  return `data:${mimeType};base64,${base64}`;
}

function asNullableString(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asConfidence(value: unknown): FieldConfidence {
  if (value === "high" || value === "medium" || value === "low") return value;
  return "unknown";
}

const MAX_OCR_ATTEMPTS = 3;
/** Au-delà, detail=low pour limiter tokens / 429. */
const LARGE_IMAGE_BYTES = 1_200_000;

function ocrModel() {
  // gpt-4o-mini : bien plus tolérant aux rate-limits / quotas que gpt-4o.
  // Surcharge : OPENAI_OCR_MODEL=gpt-4o
  return process.env.OPENAI_OCR_MODEL?.trim() || "gpt-4o-mini";
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseRetryAfterMs(header: string | null, attempt: number) {
  if (header) {
    const asSeconds = Number(header);
    if (Number.isFinite(asSeconds) && asSeconds >= 0) {
      return Math.min(asSeconds * 1000, 20_000);
    }
    const asDate = Date.parse(header);
    if (Number.isFinite(asDate)) {
      return Math.min(Math.max(asDate - Date.now(), 0), 20_000);
    }
  }
  return Math.min(1500 * 2 ** (attempt - 1), 12_000);
}

function explainOpenAiFailure(status: number, body: string) {
  const lower = body.toLowerCase();
  if (status === 401) {
    return "Clé OPENAI_API_KEY invalide ou révoquée. Mettez-la à jour sur Vercel, ou saisissez les champs manuellement.";
  }
  if (status === 429) {
    if (lower.includes("insufficient_quota") || lower.includes("billing")) {
      return (
        "Quota OpenAI épuisé (facturation). Ajoutez des crédits sur platform.openai.com/settings/organization/billing, " +
        "ou saisissez les champs manuellement — le contrat reste générable sans OCR."
      );
    }
    return (
      "Limite de débit OpenAI (429). Réessayez dans 1–2 minutes, " +
      "ou saisissez les champs manuellement."
    );
  }
  if (status === 400) {
    return "Requête OCR refusée (documents trop lourds ou format invalide). Réessayez avec des photos plus légères, ou saisie manuelle.";
  }
  return `Extraction OCR impossible (${status}). Vérifiez OPENAI_API_KEY / quotas, ou saisissez manuellement.`;
}


/**
 * Extrait UNIQUEMENT les infos visibles sur les documents.
 * Absente / illisible → null (jamais inventée).
 *
 * En cas d'échec API (429 inclus) : soft-fail → provider "none" + message clair.
 * L'admin peut toujours saisir / générer le contrat.
 */
export async function extractContractFieldsFromDocuments(
  documents: OcrDocumentInput[]
): Promise<OcrExtractionResult> {
  if (!isOpenAiConfigured()) {
    return {
      fields: [],
      rawNotes:
        "OPENAI_API_KEY manquante : extraction automatique désactivée. Saisie manuelle requise.",
      provider: "none",
    };
  }

  if (documents.length === 0) {
    return {
      fields: [],
      rawNotes: "Aucun document à analyser.",
      provider: "openai",
    };
  }

  const fieldNames = CONTRACT_FIELD_DEFS.map((item) => item.name);

  const systemPrompt = [
    "Tu es un extracteur OCR pour un dossier de location automobile en France.",
    "Tu lis UNIQUEMENT les informations présentes et lisibles sur les documents fournis.",
    "Tu ne rédiges jamais de contrat, tu ne reformules jamais de clause, tu n'inventes jamais une valeur.",
    "Si une information est absente, floue, coupée ou illisible : renvoie null.",
    "Ne complète jamais une adresse ou un nom par déduction.",
    "Réponds uniquement en JSON valide, sans markdown.",
    "Format :",
    JSON.stringify({
      fields: [
        {
          field_name: "first_name",
          value: "string|null",
          confidence: "high|medium|low",
          source_document:
            "id_card|id_card_back|driving_license|proof_of_address",
        },
      ],
      notes: "string|null",
    }),
    `Champs autorisés uniquement : ${fieldNames.join(", ")}.`,
  ].join("\n");

  const content: Array<Record<string, unknown>> = [
    {
      type: "text",
      text:
        "Extrais les champs du locataire à partir de ces documents. " +
        "Chaque champ doit indiquer le document source. Null si non lisible.",
    },
  ];

  for (const doc of documents) {
    const isImage = doc.mimeType.startsWith("image/");
    content.push({
      type: "text",
      text: `Document type=${doc.type} mime=${doc.mimeType} file=${doc.filename ?? "unknown"}`,
    });

    if (isImage) {
      content.push({
        type: "image_url",
        image_url: {
          url: bytesToDataUrl(doc.bytes, doc.mimeType),
          // "auto"/"low" consomme bien moins de tokens que "high" → moins de 429.
          detail: doc.bytes.byteLength > LARGE_IMAGE_BYTES ? "low" : "auto",
        },
      });
    } else {
      content.push({
        type: "text",
        text:
          "Document PDF reçu. Si tu ne peux pas le lire correctement, mets null " +
          "pour les champs dépendant de ce document. Préférer une photo/scan image.",
      });
    }
  }

  const requestBody = {
    model: ocrModel(),
    temperature: 0,
    response_format: { type: "json_object" as const },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content },
    ],
  };

  let lastError =
    "Extraction OCR impossible. Saisissez les champs manuellement.";

  for (let attempt = 1; attempt <= MAX_OCR_ATTEMPTS; attempt++) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY!.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      const json = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const raw = json.choices?.[0]?.message?.content ?? "{}";

      let parsed: {
        fields?: Array<Record<string, unknown>>;
        notes?: string | null;
      };
      try {
        parsed = JSON.parse(raw);
      } catch {
        return {
          fields: [],
          rawNotes:
            "Réponse OCR illisible (JSON invalide). Saisissez les champs manuellement.",
          provider: "none",
        };
      }

      const allowed = new Set<string>(fieldNames);
      const fields: OcrExtractionResult["fields"] = [];

      for (const row of parsed.fields ?? []) {
        const name = String(row.field_name ?? "");
        if (!allowed.has(name)) continue;
        fields.push({
          field_name: name as ContractFieldName,
          value: asNullableString(row.value),
          confidence: asConfidence(row.confidence),
          source_document: String(row.source_document ?? "unknown"),
        });
      }

      return {
        fields,
        rawNotes: asNullableString(parsed.notes),
        provider: "openai",
      };
    }

    const body = await response.text();
    lastError = explainOpenAiFailure(response.status, body);
    console.error(
      "[extractContractFieldsFromDocuments]",
      response.status,
      `attempt=${attempt}/${MAX_OCR_ATTEMPTS}`,
      body.slice(0, 500)
    );

    if (response.status === 429 && attempt < MAX_OCR_ATTEMPTS) {
      await sleep(parseRetryAfterMs(response.headers.get("retry-after"), attempt));
      continue;
    }

    break;
  }

  return {
    fields: [],
    rawNotes: lastError,
    provider: "none",
  };
}

/**
 * Compare les champs multi-sources et marque les incohérences.
 * Conflit → value = null + needs_review = true.
 */
export function mergeExtractedFieldsWithConsistency(
  reservationId: string,
  extracted: OcrExtractionResult["fields"]
): ExtractedFieldRecord[] {
  const byField = new Map<string, OcrExtractionResult["fields"]>();

  for (const item of extracted) {
    const list = byField.get(item.field_name) ?? [];
    list.push(item);
    byField.set(item.field_name, list);
  }

  return CONTRACT_FIELD_DEFS.map((def) => {
    const candidates = (byField.get(def.name) ?? []).filter(
      (item) => item.value != null && item.value.trim() !== ""
    );

    if (candidates.length === 0) {
      return {
        reservation_id: reservationId,
        field_name: def.name,
        value: null,
        confidence: "unknown" as const,
        source_document: null,
        status: "pending" as const,
        needs_review: true,
        inconsistency_note: null,
      };
    }

    const unique = new Map<string, (typeof candidates)[number]>();
    for (const candidate of candidates) {
      const key = normalizeFieldValue(candidate.value);
      if (!unique.has(key)) unique.set(key, candidate);
    }

    if (unique.size > 1) {
      const details = [...unique.values()]
        .map((item) => `${item.source_document}: ${item.value}`)
        .join(" | ");
      return {
        reservation_id: reservationId,
        field_name: def.name,
        value: null,
        confidence: "low" as const,
        source_document: null,
        status: "pending" as const,
        needs_review: true,
        inconsistency_note: `Incohérence détectée — ${details}`,
      };
    }

    const winner = [...unique.values()][0];
    return {
      reservation_id: reservationId,
      field_name: def.name,
      value: winner.value,
      confidence: winner.confidence,
      source_document: winner.source_document,
      status: "pending" as const,
      needs_review: winner.confidence !== "high",
      inconsistency_note: null,
    };
  });
}
