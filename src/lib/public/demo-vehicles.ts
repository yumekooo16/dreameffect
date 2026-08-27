import type { PublicVehicle } from "@/src/lib/public/vehicles-types";

/** Flotte vitrine — affichée uniquement si le catalogue Supabase est vide (preview design). */
export const DEMO_VEHICLES: PublicVehicle[] = [
  {
    id: "demo-audi-rs3",
    slug: "audi-rs3-sportback",
    brand: "Audi",
    model: "RS3",
    version: "Sportback",
    year: 2023,
    fuel: "essence",
    transmission: "automatique",
    power: 400,
    location: "Beauvais",
    description:
      "Compacte sportive, 400 ch — idéale pour un week-end dans l'Oise. Véhicule préparé avant chaque location.",
    image_url:
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1600&q=80",
    imageFrame: { fit: "cover", positionX: 50, positionY: 50, scale: 100 },
    pricing: {
      price_24h_weekday: 280,
      price_24h_weekend: 340,
      price_48h_weekend: 620,
      price_72h_weekend: 890,
      price_7_days: 1650,
      deposit: 2500,
    },
    status: "available",
  },
  {
    id: "demo-mercedes-a45",
    slug: "mercedes-a45-s-amg",
    brand: "Mercedes-Benz",
    model: "A45 S",
    version: "AMG",
    year: 2022,
    fuel: "essence",
    transmission: "automatique",
    power: 421,
    location: "Gisors",
    description:
      "Performance compacte, finitions premium. Disponible à Gisors et dans l'Eure.",
    image_url:
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1600&q=80",
    imageFrame: { fit: "cover", positionX: 50, positionY: 50, scale: 100 },
    pricing: {
      price_24h_weekday: 320,
      price_24h_weekend: 390,
      price_48h_weekend: 720,
      price_72h_weekend: 1020,
      price_7_days: 1890,
      deposit: 2800,
    },
    status: "available",
  },
  {
    id: "demo-porsche-macan",
    slug: "porsche-macan-s",
    brand: "Porsche",
    model: "Macan",
    version: "S",
    year: 2021,
    fuel: "essence",
    transmission: "automatique",
    power: 380,
    location: "Beauvais",
    description:
      "SUV sportif, confort et agilité. Parfait pour un déplacement pro ou un séjour en famille.",
    image_url:
      "https://images.unsplash.com/photo-1503376780353-7ad465976fd2?auto=format&fit=crop&w=1600&q=80",
    imageFrame: { fit: "cover", positionX: 50, positionY: 50, scale: 100 },
    pricing: {
      price_24h_weekday: 420,
      price_24h_weekend: 490,
      price_48h_weekend: 920,
      price_72h_weekend: 1320,
      price_7_days: 2450,
      deposit: 4000,
    },
    status: "available",
  },
  {
    id: "demo-golf-r",
    slug: "volkswagen-golf-8-r",
    brand: "Volkswagen",
    model: "Golf",
    version: "8 R",
    year: 2023,
    fuel: "essence",
    transmission: "automatique",
    power: 320,
    location: "Gisors",
    description:
      "Compacte iconique, 320 ch et transmission intégrale. Sobriété assumée, performance redoutable.",
    image_url:
      "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1600&q=80",
    imageFrame: { fit: "cover", positionX: 50, positionY: 50, scale: 100 },
    pricing: {
      price_24h_weekday: 260,
      price_24h_weekend: 310,
      price_48h_weekend: 580,
      price_72h_weekend: 820,
      price_7_days: 1520,
      deposit: 2200,
    },
    status: "available",
  },
  {
    id: "demo-range-velar",
    slug: "range-rover-velar-p400",
    brand: "Range Rover",
    model: "Velar",
    version: "P400",
    year: 2023,
    fuel: "essence",
    transmission: "automatique",
    power: 400,
    location: "Beauvais",
    description:
      "Design épuré, habitacle haut de gamme. Location premium Beauvais et Oise.",
    image_url:
      "https://images.unsplash.com/photo-1519641471654-76ce5427db85?auto=format&fit=crop&w=1600&q=80",
    imageFrame: { fit: "cover", positionX: 50, positionY: 50, scale: 100 },
    pricing: {
      price_24h_weekday: 520,
      price_24h_weekend: 590,
      price_48h_weekend: 1100,
      price_72h_weekend: 1580,
      price_7_days: 2950,
      deposit: 5000,
    },
    status: "available",
  },
];

export function withDemoFleetFallback(vehicles: PublicVehicle[]): PublicVehicle[] {
  if (vehicles.length > 0) return vehicles;
  // Jamais en production — uniquement en preview / local pour le design
  if (process.env.NODE_ENV === "production" && process.env.VERCEL_ENV === "production") {
    return [];
  }
  return DEMO_VEHICLES;
}
