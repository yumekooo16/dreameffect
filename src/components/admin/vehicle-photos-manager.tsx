"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Globe, Star, Trash2, Upload } from "lucide-react";
import { resolveVehicleImageUrl } from "@/src/lib/image-url";
import {
  clearVehiclePublicPhoto,
  deleteVehiclePhoto,
  setVehiclePrimaryPhoto,
  setVehiclePublicPhoto,
  uploadVehiclePhoto,
} from "@/src/lib/admin/vehicles-actions";
import type { VehicleImageRow } from "@/src/lib/admin/vehicles-types";

export default function VehiclePhotosManager({
  vehicleId,
  images,
  publicImageUrl,
  primaryImageUrl,
}: {
  vehicleId: string;
  images: VehicleImageRow[];
  publicImageUrl?: string | null;
  primaryImageUrl?: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setMessage(null);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      const result = await uploadVehiclePhoto(vehicleId, formData);

      if (result.success) {
        setMessage("Photo ajoutée.");
        router.refresh();
      } else {
        setError(result.error ?? "Échec de l'upload");
      }

      if (inputRef.current) inputRef.current.value = "";
    });
  }

  function handleSetPrimary(image: VehicleImageRow) {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await setVehiclePrimaryPhoto(
        vehicleId,
        image.id,
        image.image_url
      );

      if (result.success) {
        setMessage("Photo principale mise à jour.");
        router.refresh();
      } else {
        setError(result.error ?? "Échec de la mise à jour");
      }
    });
  }

  function handleDelete(image: VehicleImageRow) {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await deleteVehiclePhoto(
        vehicleId,
        image.id,
        image.image_url
      );

      if (result.success) {
        setMessage("Photo supprimée.");
        setDeletingId(null);
        router.refresh();
      } else {
        setError(result.error ?? "Échec de la suppression");
      }
    });
  }

  function handleSetPublic(image: VehicleImageRow) {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await setVehiclePublicPhoto(vehicleId, image.image_url);

      if (result.success) {
        setMessage("Image site web mise à jour.");
        router.refresh();
      } else {
        setError(result.error ?? "Échec de la mise à jour");
      }
    });
  }

  function handleClearPublic() {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await clearVehiclePublicPhoto(vehicleId);

      if (result.success) {
        setMessage("Image site web réinitialisée (photo principale).");
        router.refresh();
      } else {
        setError(result.error ?? "Échec de la mise à jour");
      }
    });
  }

  const activePublicImage = publicImageUrl?.trim() || primaryImageUrl?.trim() || null;
  const usesCustomPublicImage =
    Boolean(publicImageUrl?.trim()) &&
    publicImageUrl?.trim() !== primaryImageUrl?.trim();

  return (
    <div className="space-y-4">
      <p className="text-sm de-muted">
        <strong>Site internet</strong> — choisissez quelle photo apparaît sur le
        catalogue public (<code>/vehicules</code>). L&apos;image hero ci-dessous
        sert uniquement à l&apos;espace propriétaire.
      </p>

      {activePublicImage && (
        <div className="de-card-inner flex flex-wrap items-center gap-4 p-3">
          <div className="relative h-16 w-24 overflow-hidden rounded-md bg-muted">
            <Image
              src={resolveVehicleImageUrl(activePublicImage) ?? activePublicImage}
              alt="Aperçu site web"
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="de-label">Image affichée sur le site</p>
            <p className="text-sm de-muted">
              {usesCustomPublicImage
                ? "Photo dédiée au site public"
                : "Photo principale (par défaut)"}
            </p>
          </div>
          {usesCustomPublicImage && (
            <button
              type="button"
              disabled={pending}
              onClick={handleClearPublic}
              className="de-btn de-btn-ghost text-xs"
            >
              Utiliser la principale
            </button>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />
        <button
          type="button"
          disabled={pending}
          onClick={() => inputRef.current?.click()}
          className="de-btn de-btn-primary inline-flex items-center gap-2"
        >
          <Upload size={16} strokeWidth={1.75} />
          {pending ? "Traitement…" : "Ajouter une photo"}
        </button>
      </div>

      {images.length === 0 ? (
        <p className="de-empty">Aucune photo enregistrée</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => {
            const url = resolveVehicleImageUrl(image.image_url);
            const isDeleting = deletingId === image.id;
            const isPublicCover = image.image_url === activePublicImage;

            return (
              <div key={image.id} className="de-card-inner overflow-hidden p-0">
                <div className="relative h-36 bg-muted">
                  {url ? (
                    <Image
                      src={url}
                      alt="Photo véhicule"
                      fill
                      className="object-cover"
                      sizes="240px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs de-muted">
                      Image indisponible
                    </div>
                  )}
                  {image.is_primary && (
                    <span className="absolute left-2 top-2 de-badge de-badge--confirmed">
                      Principale
                    </span>
                  )}
                  {isPublicCover && (
                    <span className="absolute right-2 top-2 de-badge de-badge--pending">
                      Site web
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2 p-3">
                  {isDeleting ? (
                    <>
                      <p className="text-xs de-muted">Supprimer cette photo ?</p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => handleDelete(image)}
                          className="de-btn de-btn-ghost flex-1 text-xs text-destructive"
                        >
                          Confirmer
                        </button>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => setDeletingId(null)}
                          className="de-btn de-btn-ghost flex-1 text-xs"
                        >
                          Annuler
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {!isPublicCover && (
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => handleSetPublic(image)}
                          className="de-btn de-btn-ghost flex-1 text-xs"
                        >
                          <Globe size={14} className="mr-1 inline" />
                          Site web
                        </button>
                      )}
                      <div className="flex gap-2">
                      {!image.is_primary && (
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => handleSetPrimary(image)}
                          className="de-btn de-btn-ghost flex-1 text-xs"
                        >
                          <Star size={14} className="mr-1 inline" />
                          Principale
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => setDeletingId(image.id)}
                        className="de-btn de-btn-ghost text-xs text-destructive"
                      >
                        <Trash2 size={14} />
                      </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {message && <p className="text-sm text-[var(--blue-soft)]">{message}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
