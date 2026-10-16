import LoadingTimeout from "./loading-timeout";

export default function Loading() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-ink"
      aria-busy="true"
      aria-label="Loading ClipForge"
    >
      <div className="font-display text-lg font-bold tracking-tight">CLIPFORGE</div>
      <div className="mt-6 h-1.5 w-40 overflow-hidden rounded-full bg-ink/10">
        <div className="h-full w-1/3 animate-pulse rounded-full bg-ink/40" />
      </div>
      <p className="mt-4 text-sm text-ink-faint">Getting things ready…</p>
      <LoadingTimeout />
    </div>
  );
}
