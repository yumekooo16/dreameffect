export default function AdminReservationsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 w-32 rounded bg-muted/30" />
        <div className="h-8 w-56 rounded bg-muted/40" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="de-card-inner h-20 bg-muted/20" />
        ))}
      </div>
      <div className="de-card h-96 bg-muted/20" />
    </div>
  );
}
