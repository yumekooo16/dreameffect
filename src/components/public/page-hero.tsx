import HeroBackground from "@/src/components/public/hero-background";
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
  imageUrl,
}: PageHeroProps) {
  return (
    <section className={`de-page-hero${imageUrl ? " de-page-hero--photo" : ""}`}>
      {imageUrl ? <HeroBackground imageUrl={imageUrl} /> : null}
      <div className="de-public-container de-page-hero-content">
        <p className="de-hero-eyebrow">
          {eyebrow ?? formatServiceAreaLabel()}
        </p>
        <h1 className="de-display de-page-hero-title">{title}</h1>
        {description && (
          <p className="de-page-hero-description">{description}</p>
        )}
      </div>
    </section>
  );
}
