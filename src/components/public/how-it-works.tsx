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
    <section className="de-section" aria-labelledby="home-process-title">
      <div className="de-public-container">
        <div className="de-section-header">
          <p className="de-section-eyebrow">Processus</p>
          <h2 id="home-process-title" className="de-display de-section-title">
            Comment ça marche
          </h2>
          <p className="de-section-description">
            Trois étapes, un seul interlocuteur — que vous louiez un véhicule
            ou que vous confiiez le vôtre.
          </p>
        </div>

        <div className="de-narrative-steps">
          {HOME_PROCESS_STEPS.map(({ step, title, text, visualAlt }, index) => {
            const imageUrl = resolveVehicleImageUrl(visualUrls[index]);
            const reverse = index % 2 === 1;

            return (
              <article
                key={step}
                className={`de-narrative-step${reverse ? " de-narrative-step--reverse" : ""}`}
              >
                <div className="de-narrative-step-visual">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={visualAlt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="de-narrative-step-visual-fallback">
                      <span className="de-narrative-step-number-large">{step}</span>
                    </div>
                  )}
                  <div className="de-narrative-step-visual-overlay" />
                  <span className="de-narrative-step-number">{step}</span>
                </div>

                <div className="de-narrative-step-content">
                  <h3 className="de-display de-narrative-step-title">{title}</h3>
                  <p className="de-narrative-step-text">{text}</p>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-12">
          <Link
            href={PUBLIC_ROUTES.contact}
            className="de-btn de-btn-ghost inline-flex items-center gap-2"
          >
            Une question avant de commencer ?
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
