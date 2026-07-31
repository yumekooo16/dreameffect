import VehicleCard from "@/src/components/vehicle-card";

type Vehicle = {
  vehicle_id: string;
  brand: string;
  model: string;
  year?: number | null;
  plate?: string | null;
  mileage?: number | null;
  initial_mileage?: number | null;
  status?: string;
  image_url?: string | null;
  total_revenue?: number | null;
};
export default function VehicleList({
  vehicles,
}: {
  vehicles: Vehicle[];
}) {
  if (!vehicles || vehicles.length === 0) {
    return <p className="de-empty">Aucun véhicule enregistré.</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {vehicles.map((vehicle) => (
        <VehicleCard key={vehicle.vehicle_id} vehicle={vehicle} />
      ))}
    </div>
  );
}
