import Link from "next/link";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";

export default function HomeCitiesSection() {
  return (
    <div className="de-keys-territory">
      <strong>Oise · Eure</strong>
      <Link href={PUBLIC_ROUTES.contact} className="de-keys-chip">
        <span>60000</span> Beauvais
      </Link>
      <Link href={PUBLIC_ROUTES.contact} className="de-keys-chip">
        <span>27140</span> Gisors
      </Link>
    </div>
  );
}
