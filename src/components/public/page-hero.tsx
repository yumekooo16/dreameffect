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
    <section className="de-motion-page-hero" aria-labelledby="page-hero-title">
      <div className="de-public-container">
        <p className="de-motion-eyebrow">{eyebrow ?? formatServiceAreaLabel()}</p>
        <h1 id="page-hero-title" className="de-motion-page-title">
          {title}
        </h1>
        {description ? (
          <p className="de-motion-page-lead">{description}</p>
        ) : null}
      </div>
    </section>
  );
}
