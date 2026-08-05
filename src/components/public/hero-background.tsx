import Image from "next/image";
import { resolveVehicleImageUrl } from "@/src/lib/image-url";

type HeroBackgroundProps = {
  imageUrl?: string | null;
};

export default function HeroBackground({ imageUrl }: HeroBackgroundProps) {
  const resolved = resolveVehicleImageUrl(imageUrl);

  return (
    <div className="de-hero-visual" aria-hidden>
      {resolved ? (
        <Image
          src={resolved}
          alt=""
          fill
          priority
          className="de-hero-visual-image object-cover object-center"
          sizes="100vw"
        />
      ) : null}
      <div className="de-hero-visual-overlay" />
      <div className="de-hero-visual-grain" />
    </div>
  );
}
