"use client";
import { useEffect, useState } from "react";

/** Shows a reload button if the loading screen persists too long. */
export default function LoadingTimeout() {
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStuck(true), 12000);
    return () => clearTimeout(t);
  }, []);

  if (!stuck) return null;

  return (
    <div className="mt-4 max-w-xs text-center">
      <p className="text-sm text-ink-soft">This is taking longer than expected.</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-3 rounded-full bg-ink px-6 py-2 text-sm font-semibold text-paper"
      >
        Reload page
      </button>
    </div>
  );
}
