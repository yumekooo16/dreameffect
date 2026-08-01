"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Upload } from "lucide-react";
import { resolveVehicleImageUrl } from "@/src/lib/image-url";
import {
  deleteVehicleHeroImage,
  uploadVehicleHeroImage,
} from "@/src/lib/admin/vehicles-actions";

export default function VehicleHeroImageManager({
  vehicleId,
  heroImageUrl,
}: {
  vehicleId: string;
  heroImageUrl?: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const previewUrl = resolveVehicleImageUrl(heroImageUrl);

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setMessage(null);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      const result = await uploadVehicleHeroImage(vehicleId, formData);

      if (result.success) {
        setMessage("Image hero premium enregistrée.");
        router.refresh();
      } else {
        setError(result.error ?? "Échec de l'upload");
      }

      if (inputRef.current) inputRef.current.value = "";
    });
  }

  function handleDelete() {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await deleteVehicleHeroImage(vehicleId);

      if (result.success) {
        setMessage("Image hero supprimée.");
        setConfirmDelete(false);
        router.refresh();
      } else {
        setError(result.error ?? "Échec de la suppression");
      }
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-sm de-muted">
        PNG détouré, fond transparent — affiché uniquement dans l&apos;espace
        propriétaire (hero premium). Ne remplace pas l&apos;image du site internet.
      </p>

      <div className="de-card-inner overflow-hidden p-0">
        <div className="relative flex min-h-[12rem] items-center justify-center bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--blue)_18%,transparent),transparent_70%)] sm:min-h-[14rem]">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Aperçu image hero"
              width={480}
              height={240}
              className="max-h-48 w-auto object-contain p-4 sm:max-h-56"
            />
          ) : (
            <p className="text-sm de-muted">Aucune image hero — upload PNG recommandé</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/webp,image/jpeg"
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
          {pending ? "Traitement…" : previewUrl ? "Remplacer l'image hero" : "Ajouter image hero"}
        </button>

        {previewUrl &&
          (!confirmDelete ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => setConfirmDelete(true)}
              className="de-btn de-btn-ghost inline-flex items-center gap-2 text-destructive"
            >
              <Trash2 size={16} strokeWidth={1.75} />
              Supprimer
            </button>
          ) : (
            <>
              <button
                type="button"
                disabled={pending}
                onClick={handleDelete}
                className="de-btn de-btn-ghost text-destructive"
              >
                {pending ? "Suppression…" : "Confirmer"}
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => setConfirmDelete(false)}
                className="de-btn de-btn-ghost"
              >
                Annuler
              </button>
            </>
          ))}
      </div>

      {message && <p className="text-sm text-[var(--blue-soft)]">{message}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
