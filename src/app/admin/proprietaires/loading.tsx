export default function AdminOwnersLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 w-32 rounded bg-muted/30" />
        <div className="h-8 w-48 rounded bg-muted/40" />
        <div className="h-4 w-64 rounded bg-muted/30" />
      </div>
      <div className="de-card de-card-padded space-y-4">
        <div className="h-10 rounded bg-muted/20" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="de-list-item h-28 bg-muted/20" />
          ))}
        </div>
      </div>
    </div>
  );
}
