import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HOME_PROCESS_STEPS } from "@/src/lib/public/home-content";
import { resolveVehicleImageUrl } from "@/src/lib/image-url";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";

type HowItWorksSectionProps = {
  visualUrls?: (string | null)[];
};

export default function HowItWorksSection({
  visualUrls = [],
}: HowItWorksSectionProps) {
  return (
    <section className="de-section de-process" aria-labelledby="home-process-title">
      <div className="de-public-container">
        <div className="de-section-masthead">
          <p className="de-section-eyebrow">Parcours</p>
          <h2 id="home-process-title" className="de-display de-section-title">
            Comment ça marche
          </h2>
          <p className="de-section-lede">
            Trois temps, un interlocuteur — que vous louiez ou que vous
            confiiez le vôtre.
          </p>
        </div>

        <div className="de-timeline">
          {HOME_PROCESS_STEPS.map(({ step, title, text, visualAlt }, index) => {
            const imageUrl = resolveVehicleImageUrl(visualUrls[index]);

            return (
              <article key={step} className="de-timeline-step">
                <span className="de-timeline-index" aria-hidden>
                  {step}
                </span>
                <div className="de-timeline-visual">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={visualAlt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 32vw"
                    />
                  ) : (
                    <div className="de-timeline-fallback" />
                  )}
                </div>
                <h3 className="de-display de-timeline-title">{title}</h3>
                <p className="de-timeline-text">{text}</p>
              </article>
            );
          })}
        </div>

        <Link href={PUBLIC_ROUTES.contact} className="de-text-cta de-process-cta">
          Une question avant de commencer ?
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
