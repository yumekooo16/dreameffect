export default function ChartSkeleton() {
  return (
    <div
      className="animate-pulse rounded-[calc(var(--radius)-2px)] border border-[var(--blue-border)] bg-muted/30"
      style={{ height: 260 }}
      aria-hidden
    />
  );
}
