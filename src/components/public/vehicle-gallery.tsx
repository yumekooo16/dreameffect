"use client";

import { useState } from "react";
import VehicleImage from "@/src/components/owner/vehicle-image";
import type { PublicVehicleImage } from "@/src/lib/public/vehicles-types";

export default function VehicleGallery({
  images,
  alt,
}: {
  images: PublicVehicleImage[];
  alt: string;
}) {
  const primary =
    images.find((image) => image.is_primary) ?? images[0] ?? null;
  const [activeId, setActiveId] = useState(primary?.id ?? "");

  const activeImage =
    images.find((image) => image.id === activeId) ?? primary;

  if (!activeImage) {
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
          src={activeImage.image_url}
          alt={alt}
          priority
          className="object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="de-vehicle-gallery-thumbs">
          {images.map((image) => {
            const isActive = image.id === activeImage.id;

            return (
              <button
                key={image.id}
                type="button"
                className={`de-vehicle-gallery-thumb ${isActive ? "de-vehicle-gallery-thumb--active" : ""}`}
                onClick={() => setActiveId(image.id)}
                aria-label={`Afficher la photo ${images.indexOf(image) + 1} sur ${images.length}`}
                aria-pressed={isActive}
              >
                <VehicleImage
                  src={image.image_url}
                  alt=""
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
