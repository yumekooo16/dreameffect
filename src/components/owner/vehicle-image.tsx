import Image from "next/image";
import type { CSSProperties } from "react";
import { resolveVehicleImageUrl } from "@/src/lib/image-url";
import {
  vehicleImageFrameClassName,
  vehicleImageFrameStyle,
  type VehicleImageFrame,
} from "@/src/lib/vehicles/image-frame";

export default function VehicleImage({
  src,
  alt,
  priority = false,
  className,
  frame,
  style,
}: {
  src?: string | null;
  alt: string;
  priority?: boolean;
  className?: string;
  frame?: Partial<VehicleImageFrame> | null;
  style?: CSSProperties;
}) {
  const imageUrl = resolveVehicleImageUrl(src);
  const frameClass = frame
    ? vehicleImageFrameClassName(frame)
    : className?.includes("object-")
      ? ""
      : "object-cover";
  const frameStyle = frame ? vehicleImageFrameStyle(frame) : undefined;

  if (!imageUrl) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-muted">
        <span className="text-sm de-muted">Photo à venir</span>
      </div>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={alt}
      fill
      className={[frameClass, className].filter(Boolean).join(" ") || "object-cover"}
      style={{ ...frameStyle, ...style }}
      sizes="(max-width: 768px) 100vw, 896px"
      priority={priority}
      unoptimized={imageUrl.includes("supabase.co")}
    />
  );
}
