import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HOME_PROCESS_STEPS } from "@/src/lib/public/home-content";
import type { HomeVisual } from "@/src/lib/public/hero-image";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";
import {
  vehicleImageFrameClassName,
  vehicleImageFrameStyle,
} from "@/src/lib/vehicles/image-frame";

type HowItWorksSectionProps = {
  visuals?: (HomeVisual | null)[];
  /** @deprecated Préférer visuals */
  visualUrls?: (string | null)[];
};

export default function HowItWorksSection({
  visuals = [],
  visualUrls = [],
}: HowItWorksSectionProps) {
  return (
    <section className="de-keys-section" aria-labelledby="home-process-title">
      <div className="de-public-container">
        <p className="de-keys-eyebrow">Parcours</p>
        <h2 id="home-process-title" className="de-keys-h2">
          Comment ça marche
        </h2>
        <p className="de-keys-lede">
          Trois temps, un interlocuteur — que vous louiez ou que vous confiiez le vôtre.
        </p>

        <div className="de-keys-narrative">
          {HOME_PROCESS_STEPS.map(({ step, title, text, visualAlt }, index) => {
            const visual = visuals[index] ?? null;
            const imageUrl = visual?.url ?? visualUrls[index] ?? null;
            const alt = index % 2 === 1;

            return (
              <article
                key={step}
                className={`de-keys-step${alt ? " de-keys-step--alt" : ""}`}
              >
                <div className="de-keys-step-visual">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={visualAlt}
                      fill
                      className={vehicleImageFrameClassName(visual?.frame)}
                      style={vehicleImageFrameStyle(visual?.frame)}
                      sizes="(max-width: 900px) 100vw, 48vw"
                      unoptimized={imageUrl.includes("supabase.co")}
                    />
                  ) : null}
                </div>
                <div>
                  <p className="de-keys-step-num">{step}</p>
                  <h3 className="de-keys-step-title">{title}</h3>
                  <p className="de-keys-step-text">{text}</p>
                </div>
              </article>
            );
          })}
        </div>

        <Link href={PUBLIC_ROUTES.contact} className="de-keys-link">
          Une question avant de commencer ?
          <ArrowRight size={16} aria-hidden />
        </Link>
      </div>
    </section>
  );
}
