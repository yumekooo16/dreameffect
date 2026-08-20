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
    <section className="de-page-hero de-page-hero--split">
      <div className="de-public-container de-page-hero-grid">
        <p className="de-hero-kicker">
          {eyebrow ?? formatServiceAreaLabel()}
        </p>
        <h1 className="de-display de-page-hero-title">{title}</h1>
        {description ? (
          <p className="de-page-hero-description">{description}</p>
        ) : null}
      </div>
    </section>
  );
}
