export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="space-y-6">
        <div className="h-10 w-40 animate-pulse rounded bg-paper-2" />
        <div className="h-14 w-2/3 animate-pulse rounded bg-paper-2" />
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-12 w-full animate-pulse rounded bg-paper-2" />
          ))}
        </div>
      </div>
    </div>
  );
}
