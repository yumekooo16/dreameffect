import type { PublicVehicleStatus } from "@/src/lib/public/vehicle-status";
import type { VehiclePricing } from "@/src/lib/vehicles/pricing";
import type { VehicleImageFrame } from "@/src/lib/vehicles/image-frame";

export type PublicVehicleImage = {
  id: string;
  image_url: string;
  is_primary: boolean;
  imageFrame?: VehicleImageFrame;
};

/** Véhicule affiché dans le catalogue public. */
export type PublicVehicle = {
  id: string;
  slug: string;
  brand: string;
  model: string;
  version?: string | null;
  year?: number | null;
  fuel?: string | null;
  transmission?: string | null;
  power?: number | null;
  location?: string | null;
  description?: string | null;
  image_url?: string | null;
  imageFrame: VehicleImageFrame;
  /** @deprecated Préférer pricing + getLowestRentalPrice */
  daily_rate?: number | null;
  pricing: VehiclePricing;
  status: PublicVehicleStatus;
};

/** Fiche véhicule complète. */
export type PublicVehicleDetail = PublicVehicle & {
  color?: string | null;
  images: PublicVehicleImage[];
};

export type PublicVehicleRow = {
  id: string;
  slug: string | null;
  brand: string;
  model: string;
  version: string | null;
  year: number | null;
  fuel: string | null;
  transmission: string | null;
  power: number | null;
  location: string | null;
  description: string | null;
  color: string | null;
  status: string;
  image_url: string | null;
  public_image_url?: string | null;
  public_image_fit?: string | null;
  public_image_position_x?: number | null;
  public_image_position_y?: number | null;
  public_image_scale?: number | null;
  daily_rate: number | null;
  price_24h_weekday: number | null;
  price_24h_weekend: number | null;
  price_48h_weekend: number | null;
  price_72h_weekend: number | null;
  price_7_days: number | null;
  deposit: number | null;
  is_published: boolean;
};
