export default function OwnerLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="de-card de-card-padded space-y-4">
        <div className="h-8 w-48 rounded bg-muted/40" />
        <div className="h-4 w-64 rounded bg-muted/30" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="de-card-inner h-20 bg-muted/20" />
          ))}
        </div>
      </div>
      <div className="de-card h-40 bg-muted/20" />
    </div>
  );
}
