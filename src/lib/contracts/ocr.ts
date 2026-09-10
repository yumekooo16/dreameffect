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

/**
 * Extrait UNIQUEMENT les infos visibles sur les documents.
 * Absente / illisible → null (jamais inventée).
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
          detail: "high",
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

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY!.trim()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_OCR_MODEL?.trim() || "gpt-4o",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("[extractContractFieldsFromDocuments]", response.status, body);
    throw new Error(
      `Extraction OCR impossible (${response.status}). Vérifiez OPENAI_API_KEY / quotas.`
    );
  }

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
    throw new Error("Réponse OCR illisible (JSON invalide).");
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
