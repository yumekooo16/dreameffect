"use client";

type Document = {
  id: string;
  type: string;
  name: string;
  file_url: string;
  expiration_date?: string | null;
  is_valid?: boolean | null;
};

const DOCUMENT_CATEGORIES = [
  {
    label: "Carte grise",
    match: (type: string) =>
      /carte.?grise|registration|grey.?card/i.test(type),
  },
  {
    label: "Assurance",
    match: (type: string) => /assurance|insurance/i.test(type),
  },
  {
    label: "Contrôle technique",
    match: (type: string) =>
      /contr[oô]le.?technique|technical.?control|ct/i.test(type),
  },
] as const;

function findDocument(documents: Document[], match: (type: string) => boolean) {
  return documents.find((d) => match(d.type) || match(d.name));
}

export default function Documents({
  documents,
}: {
  documents: Document[];
}) {
  if (documents.length === 0) {
    return <p className="de-empty">Aucun document disponible</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-1">
      {DOCUMENT_CATEGORIES.map((category) => {
        const doc = findDocument(documents, category.match);

        return (
          <div key={category.label} className="de-card-inner">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="de-label">{category.label}</p>
                {doc ? (
                  <>
                    <p className="mt-1 text-sm font-medium">{doc.name}</p>
                    {doc.expiration_date && (
                      <p className="mt-1 text-xs de-muted">
                        Valide jusqu&apos;au{" "}
                        {new Date(doc.expiration_date).toLocaleDateString(
                          "fr-FR"
                        )}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="mt-1 text-sm de-muted">Non renseigné</p>
                )}
              </div>

              {doc && (
                <span
                  className={`de-badge ${doc.is_valid ? "de-badge--valid" : "de-badge--invalid"}`}
                >
                  {doc.is_valid ? "Valide" : "Expiré"}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
