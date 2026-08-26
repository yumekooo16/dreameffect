import Link from "next/link";
import { LOCAL_ROUTES } from "@/src/lib/public/site";

export default function HomeCitiesSection() {
  return (
    <div className="de-keys-territory">
      <strong>Oise · Eure</strong>
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
    </div>
  );
}
