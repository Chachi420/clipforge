"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center text-ink">
      <div className="micro-label mb-4">Something broke</div>
      <h1 className="display text-4xl md:text-5xl">That wasn&apos;t supposed to happen.</h1>
      <p className="mt-4 max-w-md text-ink-soft">
        Something went wrong on our end. Your clips and earnings are safe — this is
        just a hiccup loading the page.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => reset()}
          className="pill bg-ink px-6 py-3 text-sm font-semibold text-paper transition hover:bg-ink-soft"
        >
          Try again
        </button>
        <a
          href="/"
          className="pill border border-line/20 px-6 py-3 text-sm font-semibold text-ink transition hover:bg-ink/5"
        >
          Back home
        </a>
      </div>
    </div>
  );
}
