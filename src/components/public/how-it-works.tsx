import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HOME_PROCESS_STEPS } from "@/src/lib/public/home-content";
import { resolveVehicleImageUrl } from "@/src/lib/image-url";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";
import Image from "next/image";

type HowItWorksSectionProps = {
  visualUrls?: (string | null)[];
};

export default function HowItWorksSection({
  visualUrls = [],
}: HowItWorksSectionProps) {
  return (
    <section className="de-section de-section-alt" aria-labelledby="home-process-title">
      <div className="de-public-container">
        <p className="de-motion-eyebrow">Parcours</p>
        <h2 id="home-process-title" className="de-motion-section-title">
          Comment ça marche
        </h2>
        <p className="de-motion-page-lead">
          Trois temps, un interlocuteur — que vous louiez ou que vous confiiez le vôtre.
        </p>

        <div className="de-spine" style={{ marginTop: "2.5rem" }}>
          {HOME_PROCESS_STEPS.map(({ step, title, text, visualAlt }, index) => {
            const imageUrl = resolveVehicleImageUrl(visualUrls[index]);
            const flip = index % 2 === 1;

            return (
              <article
                key={step}
                className={`de-spine-step${flip ? " de-spine-step--flip" : ""}`}
              >
                <div className="de-spine-visual">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={visualAlt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 900px) 100vw, 45vw"
                    />
                  ) : null}
                </div>
                <div className="de-spine-copy">
                  <span className="de-spine-num">{step}</span>
                  <h3 className="de-spine-title">{title}</h3>
                  <p className="de-spine-text">{text}</p>
                </div>
              </article>
            );
          })}
        </div>

        <Link href={PUBLIC_ROUTES.contact} className="de-text-cta" style={{ marginTop: "2rem" }}>
          Une question avant de commencer ?
          <ArrowRight size={16} aria-hidden />
        </Link>
      </div>
    </section>
  );
}
