import Link from "next/link";
import Image from "next/image";
import { HOME_PROCESS_STEPS } from "@/src/lib/public/home-content";
import { resolveVehicleImageUrl } from "@/src/lib/image-url";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";

const STEP_LINKS = [
  { href: PUBLIC_ROUTES.vehicles, label: "Voir la flotte" },
  { href: PUBLIC_ROUTES.contact, label: "Organiser une remise" },
  { href: PUBLIC_ROUTES.owners, label: "Confier mon véhicule" },
] as const;

type HowItWorksSectionProps = {
  visualUrls?: (string | null)[];
};

export default function HowItWorksSection({
  visualUrls = [],
}: HowItWorksSectionProps) {
  return (
    <section className="de-chapters" aria-labelledby="home-process-title">
      <h2 id="home-process-title" className="sr-only">
        Comment ça marche
      </h2>
      {HOME_PROCESS_STEPS.map(({ step, title, text, visualAlt }, index) => {
        const imageUrl = resolveVehicleImageUrl(visualUrls[index]);
        const link = STEP_LINKS[index];

        return (
          <article key={step} className="de-chapter">
            <div className="de-chapter-media">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={visualAlt}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
              ) : null}
              <div className="de-chapter-overlay" />
            </div>
            <div className="de-public-container de-chapter-copy">
              <span className="de-chapter-index">{step}</span>
              <h3 className="de-chapter-title">{title}</h3>
              <p className="de-chapter-text">{text}</p>
              <Link href={link.href} className="de-text-link de-chapter-link">
                {link.label}
              </Link>
            </div>
          </article>
        );
      })}
    </section>
  );
}
