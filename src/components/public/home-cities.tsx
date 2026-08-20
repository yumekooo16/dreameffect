import Link from "next/link";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";

export default function HomeCitiesSection() {
  return (
    <section className="de-motion-cities" aria-label="Zones desservies">
      <Link href={PUBLIC_ROUTES.contact} className="de-motion-city de-motion-city--beauvais">
        <span className="de-motion-city-code">60000</span>
        <span className="de-motion-city-name">Beauvais</span>
        <span className="de-motion-city-region">Oise</span>
      </Link>
      <Link href={PUBLIC_ROUTES.contact} className="de-motion-city de-motion-city--gisors">
        <span className="de-motion-city-code">27140</span>
        <span className="de-motion-city-name">Gisors</span>
        <span className="de-motion-city-region">Eure</span>
      </Link>
    </section>
  );
}
