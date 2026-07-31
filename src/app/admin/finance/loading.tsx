export default function AdminFinanceLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 w-32 rounded bg-muted/30" />
        <div className="h-8 w-48 rounded bg-muted/40" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="de-card-inner h-20 bg-muted/20" />
        ))}
      </div>
      <div className="de-card h-96 bg-muted/20" />
    </div>
  );
}
