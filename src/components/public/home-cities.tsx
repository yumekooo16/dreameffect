import Link from "next/link";
import { LOCAL_ROUTES } from "@/src/lib/public/site";

export default function HomeCitiesSection() {
  return (
    <nav className="de-keys-territory" aria-labelledby="home-territory-title">
      <h2 id="home-territory-title" className="sr-only">
        Zones desservies
      </h2>
      <strong>Beauvais · Gisors · Île-de-France</strong>
      <Link href={LOCAL_ROUTES.locationBeauvais} className="de-keys-chip">
        <span>60000</span> Beauvais — location
      </Link>
      <Link href={LOCAL_ROUTES.conciergerieBeauvais} className="de-keys-chip">
        Conciergerie Beauvais
      </Link>
      <Link href={LOCAL_ROUTES.locationGisors} className="de-keys-chip">
        <span>27140</span> Gisors — location
      </Link>
      <Link href={LOCAL_ROUTES.conciergerieGisors} className="de-keys-chip">
        Conciergerie Gisors
      </Link>
      <Link href={LOCAL_ROUTES.locationIdf} className="de-keys-chip">
        Île-de-France
      </Link>
      <Link href={LOCAL_ROUTES.locationAirportTille} className="de-keys-chip">
        Aéroport Beauvais-Tillé
      </Link>
    </nav>
  );
}
