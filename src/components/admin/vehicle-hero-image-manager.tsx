"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Upload } from "lucide-react";
import StorageImage from "@/src/components/admin/storage-image";
import {
  formatUploadError,
  prepareImageForUpload,
} from "@/src/lib/admin/prepare-image-upload";
import {
  deleteVehicleHeroImage,
  uploadVehicleHeroImage,
} from "@/src/lib/admin/vehicles-actions";

const MAX_FILE_SIZE_MB = 10;

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
  const [pending, setPending] = useState(false);

  async function runAction(action: () => Promise<{ success: boolean; error?: string }>) {
    setMessage(null);
    setError(null);
    setPending(true);

    try {
      const result = await action();

      if (result.success) {
        router.refresh();
        return true;
      }

      setError(result.error ?? "Une erreur est survenue");
      return false;
    } catch (err) {
      setError(
        formatUploadError(err, "Impossible de traiter la demande. Réessayez.")
      );
      return false;
    } finally {
      setPending(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`Image trop lourde (max ${MAX_FILE_SIZE_MB} Mo).`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setPending(true);
    setError(null);
    setMessage(null);

    try {
      const prepared = await prepareImageForUpload(file, { preferPng: true });
      const formData = new FormData();
      formData.append("file", prepared);

      const ok = await runAction(() =>
        uploadVehicleHeroImage(vehicleId, formData)
      );
      if (ok) setMessage("Image hero premium enregistrée.");
    } catch (err) {
      setError(formatUploadError(err, "Impossible de préparer l'image."));
      setPending(false);
    }

    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleDelete() {
    const ok = await runAction(() => deleteVehicleHeroImage(vehicleId));
    if (ok) {
      setMessage("Image hero supprimée.");
      setConfirmDelete(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm de-muted">
        PNG détouré, fond transparent — affiché uniquement dans l&apos;espace
        propriétaire (hero premium). Ne remplace pas l&apos;image du site internet.
        Compression automatique avant envoi.
      </p>

      <div className="de-card-inner overflow-hidden p-0">
        <div className="relative flex min-h-[12rem] items-center justify-center bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--blue)_18%,transparent),transparent_70%)] sm:min-h-[14rem]">
          {heroImageUrl ? (
            <StorageImage
              src={heroImageUrl}
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
          {pending
            ? "Traitement…"
            : heroImageUrl
              ? "Remplacer l'image hero"
              : "Ajouter image hero"}
        </button>

        {heroImageUrl &&
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
