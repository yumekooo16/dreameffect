import VehicleImage from "@/src/components/owner/vehicle-image";
import type { PublicVehicleImage } from "@/src/lib/public/vehicles-types";

export default function VehicleGallery({
  images,
  alt,
}: {
  images: PublicVehicleImage[];
  alt: string;
}) {
  const cover =
    images.find((image) => image.is_primary) ?? images[0] ?? null;

  if (!cover) {
    return (
      <div className="de-vehicle-gallery-empty">
        <span className="text-sm de-muted">Photos à venir</span>
      </div>
    );
  }

  return (
    <div className="de-vehicle-gallery">
      <div className="de-vehicle-gallery-main">
        <VehicleImage
          src={cover.image_url}
          alt={alt}
          priority
          className="object-cover"
        />
      </div>
    </div>
  );
}
