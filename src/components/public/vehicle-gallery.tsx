"use client";

import { useState } from "react";
import VehicleImage from "@/src/components/owner/vehicle-image";
import type { PublicVehicleImage } from "@/src/lib/public/vehicles-types";
import type { VehicleImageFrame } from "@/src/lib/vehicles/image-frame";

export default function VehicleGallery({
  images,
  alt,
  frame,
}: {
  images: PublicVehicleImage[];
  alt: string;
  frame?: VehicleImageFrame | null;
}) {
  const initial =
    images.find((image) => image.is_primary) ?? images[0] ?? null;
  const [activeId, setActiveId] = useState(initial?.id ?? null);
  const active =
    images.find((image) => image.id === activeId) ?? initial ?? null;

  if (!active) {
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
          src={active.image_url}
          alt={alt}
          priority
          frame={frame}
        />
      </div>

      {images.length > 1 ? (
        <div className="de-vehicle-gallery-thumbs" role="list">
          {images.map((image, index) => {
            const isActive = image.id === active.id;
            return (
              <button
                key={image.id}
                type="button"
                role="listitem"
                aria-label={`Photo ${index + 1}`}
                aria-pressed={isActive}
                className={`de-vehicle-gallery-thumb${isActive ? " de-vehicle-gallery-thumb--active" : ""}`}
                onClick={() => setActiveId(image.id)}
              >
                <VehicleImage
                  src={image.image_url}
                  alt=""
                  frame={frame}
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
