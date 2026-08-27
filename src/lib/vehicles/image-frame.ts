/** Cadrage des photos véhicule sur le site public. */

export const MAX_VEHICLE_PHOTOS = 5;

export type PublicImageFit = "cover" | "contain";

export type VehicleImageFrame = {
  fit: PublicImageFit;
  positionX: number;
  positionY: number;
  scale: number;
};

export const DEFAULT_VEHICLE_IMAGE_FRAME: VehicleImageFrame = {
  fit: "cover",
  positionX: 50,
  positionY: 50,
  scale: 100,
};

export function clampPercent(value: number, fallback = 50) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function clampScale(value: number, fallback = 100) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(150, Math.max(100, Math.round(value)));
}

export function normalizeVehicleImageFrame(
  input?: Partial<VehicleImageFrame> | null
): VehicleImageFrame {
  const fit = input?.fit === "contain" ? "contain" : "cover";

  return {
    fit,
    positionX: clampPercent(input?.positionX ?? DEFAULT_VEHICLE_IMAGE_FRAME.positionX),
    positionY: clampPercent(input?.positionY ?? DEFAULT_VEHICLE_IMAGE_FRAME.positionY),
    scale: clampScale(input?.scale ?? DEFAULT_VEHICLE_IMAGE_FRAME.scale),
  };
}

/** Lit le cadrage stocké sur une ligne vehicle_images (ou équivalent). */
export function frameFromImageColumns(row?: {
  image_fit?: string | null;
  image_position_x?: number | null;
  image_position_y?: number | null;
  image_scale?: number | null;
} | null): VehicleImageFrame {
  return normalizeVehicleImageFrame({
    fit: row?.image_fit === "contain" ? "contain" : "cover",
    positionX: row?.image_position_x ?? DEFAULT_VEHICLE_IMAGE_FRAME.positionX,
    positionY: row?.image_position_y ?? DEFAULT_VEHICLE_IMAGE_FRAME.positionY,
    scale: row?.image_scale ?? DEFAULT_VEHICLE_IMAGE_FRAME.scale,
  });
}

export function imageFrameToColumns(frame: VehicleImageFrame) {
  return {
    image_fit: frame.fit,
    image_position_x: frame.positionX,
    image_position_y: frame.positionY,
    image_scale: frame.scale,
  };
}

/** Styles CSS pour object-fit / object-position / zoom. */
export function vehicleImageFrameStyle(frame?: Partial<VehicleImageFrame> | null) {
  const normalized = normalizeVehicleImageFrame(frame);
  const scale = normalized.scale / 100;

  return {
    objectFit: normalized.fit,
    objectPosition: `${normalized.positionX}% ${normalized.positionY}%`,
    ["--de-img-scale" as string]: String(scale),
    transform: "scale(var(--de-img-scale, 1))",
    transformOrigin: `${normalized.positionX}% ${normalized.positionY}%`,
  } as const;
}

export function vehicleImageFrameClassName(frame?: Partial<VehicleImageFrame> | null) {
  const normalized = normalizeVehicleImageFrame(frame);
  return normalized.fit === "contain" ? "object-contain" : "object-cover";
}
