import type { Metadata } from "next";
import VehicleFlyer from "@/src/components/public/vehicle-flyer";
import { BMW_SERIE2_FLYER } from "@/src/lib/public/flyers/bmw-serie-2";

export const metadata: Metadata = {
  title: "Flyer BMW Série 2",
  robots: { index: false, follow: false },
};

export default function BmwSerie2FlyerPage() {
  return <VehicleFlyer data={BMW_SERIE2_FLYER} />;
}
