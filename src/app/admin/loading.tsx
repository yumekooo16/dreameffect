export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="de-card de-card-padded space-y-4">
        <div className="h-8 w-56 rounded bg-muted/40" />
        <div className="h-4 w-72 rounded bg-muted/30" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="de-card-inner h-20 bg-muted/20" />
          ))}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="de-card-inner h-24 bg-muted/20" />
        ))}
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="de-card h-72 bg-muted/20" />
        <div className="de-card h-72 bg-muted/20" />
      </div>
    </div>
  );
}
