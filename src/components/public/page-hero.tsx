type PageHeroProps = {
  title: string;
  description?: string;
};

export default function PageHero({ title, description }: PageHeroProps) {
  return (
    <section className="de-page-hero">
      <div className="de-public-container">
        <h1 className="de-display de-page-hero-title">{title}</h1>
        {description && (
          <p className="de-page-hero-description">{description}</p>
        )}
      </div>
    </section>
  );
}
