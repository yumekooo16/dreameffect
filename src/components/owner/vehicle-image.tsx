import Image from "next/image";
import { resolveVehicleImageUrl } from "@/src/lib/image-url";

export default function VehicleImage({
  src,
  alt,
  priority = false,
  className = "object-cover",
}: {
  src?: string | null;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  const imageUrl = resolveVehicleImageUrl(src);

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
      className={className}
      sizes="(max-width: 768px) 100vw, 896px"
      priority={priority}
    />
  );
}
