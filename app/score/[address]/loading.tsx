export default function ScoreLoadingPage() {
  return (
    <div className="flex flex-col gap-5">
      <div className="border-b border-white/8 pb-5">
        <p className="text-muted-foreground font-mono text-xs">Loading wallet score...</p>
        <div className="bg-card mt-3 h-4 w-80 max-w-full rounded" />
      </div>
      <div className="bg-card rounded-md border border-white/8 p-6">
        <div className="h-12 w-24 rounded bg-white/10" />
        <div className="mt-4 h-3 w-64 rounded bg-white/10" />
        <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className="h-16 rounded bg-white/10" />
          <div className="h-16 rounded bg-white/10" />
          <div className="h-16 rounded bg-white/10" />
        </div>
      </div>
    </div>
  );
}
