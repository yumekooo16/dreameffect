"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Globe, Star, Trash2, Upload } from "lucide-react";
import StorageImage from "@/src/components/admin/storage-image";
import {
  formatUploadError,
  prepareImageForUpload,
} from "@/src/lib/admin/prepare-image-upload";
import {
  clearVehiclePublicPhoto,
  deleteVehiclePhoto,
  setVehiclePrimaryPhoto,
  setVehiclePublicPhoto,
  updateVehiclePublicImageFrame,
  uploadVehiclePhoto,
} from "@/src/lib/admin/vehicles-actions";
import type { VehicleImageRow } from "@/src/lib/admin/vehicles-types";
import {
  DEFAULT_VEHICLE_IMAGE_FRAME,
  MAX_VEHICLE_PHOTOS,
  normalizeVehicleImageFrame,
  vehicleImageFrameClassName,
  vehicleImageFrameStyle,
  type PublicImageFit,
  type VehicleImageFrame,
} from "@/src/lib/vehicles/image-frame";

const MAX_FILE_SIZE_MB = 10;

export default function VehiclePhotosManager({
  vehicleId,
  images,
  publicImageUrl,
  primaryImageUrl,
  imageFrame,
}: {
  vehicleId: string;
  images: VehicleImageRow[];
  publicImageUrl?: string | null;
  primaryImageUrl?: string | null;
  imageFrame?: Partial<VehicleImageFrame> | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [frame, setFrame] = useState<VehicleImageFrame>(() =>
    normalizeVehicleImageFrame(imageFrame)
  );
  const [framePending, startFrameTransition] = useTransition();
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setFrame(normalizeVehicleImageFrame(imageFrame));
  }, [imageFrame]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const atLimit = images.length >= MAX_VEHICLE_PHOTOS;

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

  function scheduleFrameSave(next: VehicleImageFrame) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      startFrameTransition(async () => {
        const result = await updateVehiclePublicImageFrame(vehicleId, next);
        if (result.success) {
          setMessage("Cadrage enregistré.");
          setError(null);
          router.refresh();
        } else {
          setError(result.error ?? "Impossible d'enregistrer le cadrage");
        }
      });
    }, 450);
  }

  function updateFrame(partial: Partial<VehicleImageFrame>) {
    setFrame((prev) => {
      const next = normalizeVehicleImageFrame({ ...prev, ...partial });
      scheduleFrameSave(next);
      return next;
    });
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (atLimit) {
      setError(`Maximum ${MAX_VEHICLE_PHOTOS} photos par véhicule.`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`Photo trop lourde (max ${MAX_FILE_SIZE_MB} Mo).`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setPending(true);
    setError(null);
    setMessage(null);

    try {
      const prepared = await prepareImageForUpload(file);
      const formData = new FormData();
      formData.append("file", prepared);

      const ok = await runAction(() => uploadVehiclePhoto(vehicleId, formData));
      if (ok) setMessage("Photo ajoutée.");
    } catch (err) {
      setError(formatUploadError(err, "Impossible de préparer la photo."));
      setPending(false);
    }

    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleSetPrimary(image: VehicleImageRow) {
    const ok = await runAction(() =>
      setVehiclePrimaryPhoto(vehicleId, image.id, image.image_url)
    );
    if (ok) setMessage("Photo principale mise à jour.");
  }

  async function handleDelete(image: VehicleImageRow) {
    const ok = await runAction(() =>
      deleteVehiclePhoto(vehicleId, image.id, image.image_url)
    );
    if (ok) {
      setMessage("Photo supprimée.");
      setDeletingId(null);
    }
  }

  async function handleSetPublic(image: VehicleImageRow) {
    const ok = await runAction(() =>
      setVehiclePublicPhoto(vehicleId, image.image_url)
    );
    if (ok) setMessage("Image site web mise à jour.");
  }

  async function handleClearPublic() {
    const ok = await runAction(() => clearVehiclePublicPhoto(vehicleId));
    if (ok) setMessage("Image site web réinitialisée (photo principale).");
  }

  const activePublicImage = publicImageUrl?.trim() || primaryImageUrl?.trim() || null;
  const usesCustomPublicImage =
    Boolean(publicImageUrl?.trim()) &&
    publicImageUrl?.trim() !== primaryImageUrl?.trim();

  return (
    <div className="space-y-4">
      <p className="text-sm de-muted">
        <strong>Site internet</strong> — jusqu&apos;à {MAX_VEHICLE_PHOTOS} photos
        par véhicule. Choisissez la couverture catalogue et réglez le cadrage.
        Compression automatique avant envoi.
      </p>

      {activePublicImage && (
        <div className="de-card-inner space-y-4 p-3">
          <div className="flex flex-wrap items-start gap-4">
            <div className="relative h-28 w-40 overflow-hidden rounded-md bg-muted">
              <StorageImage
                src={activePublicImage}
                alt="Aperçu site web"
                fill
                sizes="160px"
                className={vehicleImageFrameClassName(frame)}
                style={vehicleImageFrameStyle(frame)}
              />
            </div>
            <div className="min-w-0 flex-1 space-y-3">
              <div>
                <p className="de-label">Image affichée sur le site</p>
                <p className="text-sm de-muted">
                  {usesCustomPublicImage
                    ? "Photo dédiée au site public"
                    : "Photo principale (par défaut)"}
                  {framePending ? " · enregistrement…" : ""}
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
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="de-label">Mode d&apos;affichage</span>
              <select
                className="de-input mt-1 w-full"
                value={frame.fit}
                onChange={(e) =>
                  updateFrame({ fit: e.target.value as PublicImageFit })
                }
              >
                <option value="cover">Remplir le cadre (recadre)</option>
                <option value="contain">Voir toute la photo</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="de-label">Zoom ({frame.scale}%)</span>
              <input
                type="range"
                min={100}
                max={150}
                step={1}
                value={frame.scale}
                className="mt-3 w-full"
                onChange={(e) =>
                  updateFrame({ scale: Number(e.target.value) })
                }
              />
            </label>
            <label className="block text-sm">
              <span className="de-label">Position horizontale ({frame.positionX}%)</span>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={frame.positionX}
                className="mt-3 w-full"
                onChange={(e) =>
                  updateFrame({ positionX: Number(e.target.value) })
                }
              />
            </label>
            <label className="block text-sm">
              <span className="de-label">Position verticale ({frame.positionY}%)</span>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={frame.positionY}
                className="mt-3 w-full"
                onChange={(e) =>
                  updateFrame({ positionY: Number(e.target.value) })
                }
              />
            </label>
          </div>
          <button
            type="button"
            className="de-btn de-btn-ghost text-xs"
            onClick={() => {
              const reset = DEFAULT_VEHICLE_IMAGE_FRAME;
              setFrame(reset);
              scheduleFrameSave(reset);
            }}
          >
            Réinitialiser le cadrage
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={handleUpload}
        />
        <button
          type="button"
          disabled={pending || atLimit}
          onClick={() => inputRef.current?.click()}
          className="de-btn de-btn-primary inline-flex items-center gap-2"
        >
          <Upload size={16} strokeWidth={1.75} />
          {pending
            ? "Traitement…"
            : atLimit
              ? `${MAX_VEHICLE_PHOTOS}/${MAX_VEHICLE_PHOTOS} photos`
              : `Ajouter une photo (${images.length}/${MAX_VEHICLE_PHOTOS})`}
        </button>
      </div>

      {images.length === 0 ? (
        <p className="de-empty">Aucune photo enregistrée</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => {
            const isDeleting = deletingId === image.id;
            const isPublicCover = image.image_url === activePublicImage;

            return (
              <div key={image.id} className="de-card-inner overflow-hidden p-0">
                <div className="relative h-36 bg-muted">
                  <StorageImage
                    src={image.image_url}
                    alt="Photo véhicule"
                    fill
                    sizes="240px"
                  />
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
