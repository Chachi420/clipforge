"use client";
import { useEffect, useState } from "react";

export default function Loading() {
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStuck(true), 12000);
    return () => clearTimeout(t);
  }, []);

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
      {!stuck ? (
        <p className="mt-4 text-sm text-ink-faint">Getting things ready…</p>
      ) : (
        <div className="mt-4 max-w-xs text-center">
          <p className="text-sm text-ink-soft">
            This is taking longer than expected.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 rounded-full bg-ink px-6 py-2 text-sm font-semibold text-paper"
          >
            Reload page
          </button>
        </div>
      )}
    </div>
  );
}
