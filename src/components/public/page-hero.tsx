import HeroBackground from "@/src/components/public/hero-background";

type PageHeroProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  imageUrl?: string | null;
  compact?: boolean;
};

export default function PageHero({
  title,
  description,
  eyebrow,
  imageUrl,
  compact = false,
}: PageHeroProps) {
  const classes = [
    "de-page-hero",
    imageUrl ? "de-page-hero--photo" : "",
    compact ? "de-page-hero--compact" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={classes}>
      {imageUrl ? <HeroBackground imageUrl={imageUrl} /> : null}
      <div className="de-public-container de-page-hero-content">
        {eyebrow ? <p className="de-hero-eyebrow">{eyebrow}</p> : null}
        <h1 className="de-display de-page-hero-title">{title}</h1>
        {description && (
          <p className="de-page-hero-description">{description}</p>
        )}
      </div>
    </section>
  );
}
