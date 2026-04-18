export default function ScoreLoadingPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="animate-pulse border-b border-white/8 pb-6">
        <div className="bg-card h-4 w-24 rounded" />
        <div className="bg-card mt-3 h-4 w-80 max-w-full rounded" />
      </div>
      <div className="bg-card animate-pulse rounded-md border border-white/8 p-6">
        <div className="h-12 w-24 rounded bg-white/10" />
        <div className="mt-4 h-3 w-64 rounded bg-white/10" />
        <div className="mt-6 grid grid-cols-3 gap-2">
          <div className="h-16 rounded bg-white/10" />
          <div className="h-16 rounded bg-white/10" />
          <div className="h-16 rounded bg-white/10" />
        </div>
      </div>
    </div>
  );
}
