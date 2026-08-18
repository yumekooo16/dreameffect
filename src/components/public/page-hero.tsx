import HeroBackground from "@/src/components/public/hero-background";

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
      {imageUrl ? (
        <div className="de-page-hero-media">
          <HeroBackground imageUrl={imageUrl} />
        </div>
      ) : null}
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
