export default function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="de-section-label">{title}</h2>
      <div className="de-card de-card-padded">{children}</div>
    </section>
  );
}
