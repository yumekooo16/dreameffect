import { formatServiceAreaLabel } from "@/src/lib/public/local-seo";

type PageHeroProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  imageUrl?: string | null;
};

export default function PageHero({
  title,
  description,
  eyebrow,
}: PageHeroProps) {
  return (
    <section className="de-exhibit de-exhibit--page" aria-labelledby="page-hero-title">
      <div className="de-exhibit-watermark" aria-hidden>
        ·
      </div>
      <div className="de-public-container de-exhibit-grid de-exhibit-grid--page">
        <div>
          <p className="de-mono-label">{eyebrow ?? formatServiceAreaLabel()}</p>
          <h1 id="page-hero-title" className="de-exhibit-title">
            {title}
          </h1>
        </div>
        {description ? (
          <p className="de-exhibit-lead">{description}</p>
        ) : null}
      </div>
    </section>
  );
}
