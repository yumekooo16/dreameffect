import Image from "next/image";
import { resolveVehicleImageUrl } from "@/src/lib/image-url";
import { SITE_NAME } from "@/src/lib/public/site";
import {
  vehicleImageFrameClassName,
  vehicleImageFrameStyle,
  type VehicleImageFrame,
} from "@/src/lib/vehicles/image-frame";

type HeroBackgroundProps = {
  imageUrl?: string | null;
  frame?: VehicleImageFrame | null;
};

export default function HeroBackground({ imageUrl, frame }: HeroBackgroundProps) {
  const resolved = resolveVehicleImageUrl(imageUrl);

  return (
    <div className="de-hero-visual">
      {resolved ? (
        <Image
          src={resolved}
          alt={`Véhicule premium disponible à la location — ${SITE_NAME}`}
          fill
          priority
          className={`de-hero-visual-image ${vehicleImageFrameClassName(frame)}`}
          style={vehicleImageFrameStyle(frame)}
          sizes="100vw"
        />
      ) : null}
      <div className="de-hero-visual-overlay" />
      <div className="de-hero-visual-grain" />
    </div>
  );
}
