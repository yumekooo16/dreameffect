import Image from "next/image";
import type { CSSProperties } from "react";
import { resolveVehicleImageUrl } from "@/src/lib/image-url";

type StorageImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  style?: CSSProperties;
  sizes?: string;
  priority?: boolean;
} & (
  | { fill: true; width?: never; height?: never }
  | { fill?: false; width: number; height: number }
);

/** Image véhicule depuis Supabase Storage — évite les erreurs next/image en admin. */
export default function StorageImage({
  src,
  alt,
  className = "object-cover",
  style,
  sizes,
  priority = false,
  ...layout
}: StorageImageProps) {
  const imageUrl = resolveVehicleImageUrl(src);

  if (!imageUrl) {
    if (layout.fill) {
      return (
        <div className="absolute inset-0 flex items-center justify-center text-xs de-muted">
          Image indisponible
        </div>
      );
    }

    return null;
  }

  const imageProps = {
    src: imageUrl,
    alt,
    className,
    style,
    unoptimized: imageUrl.includes("supabase.co"),
    priority,
  };

  if (layout.fill) {
    return (
      <Image
        {...imageProps}
        fill
        sizes={sizes ?? "240px"}
      />
    );
  }

  return (
    <Image
      {...imageProps}
      width={layout.width}
      height={layout.height}
      sizes={sizes}
    />
  );
}
