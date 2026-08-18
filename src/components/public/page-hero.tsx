type PageHeroProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  compact?: boolean;
};

export default function PageHero({
  title,
  description,
  eyebrow,
  compact = false,
}: PageHeroProps) {
  return (
    <section className={`de-page-hero${compact ? " de-page-hero--compact" : ""}`}>
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
