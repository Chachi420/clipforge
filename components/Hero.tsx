"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <header className="relative flex min-h-[88svh] items-center justify-center overflow-hidden">
      <div className="relative w-full px-5 text-center md:px-6">
        <div
          className={`micro-label mb-8 transition-all duration-700 ease-out ${
            entered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          The pay-per-view clipping network
        </div>
        <h1 className="display text-[clamp(2.75rem,14vw,12rem)] leading-[0.92]">
          <span className="block overflow-hidden pb-1">
            <span
              className={`block transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                entered ? "translate-y-0" : "translate-y-full"
              }`}
            >
              Clip. Post.
            </span>
          </span>
          <span className="block overflow-hidden pb-2">
            <span
              className={`block transition-all delay-100 duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                entered ? "translate-y-0" : "translate-y-full"
              }`}
            >
              Get Paid.
            </span>
          </span>
        </h1>
        <p
          className={`mx-auto mt-8 max-w-md text-[17px] leading-relaxed text-ink-soft transition-all delay-200 duration-700 ease-out ${
            entered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          You already watch the clips. Now get paid for posting them — brands pay per verified view.
        </p>
        <div
          className={`mt-10 flex flex-col items-center justify-center gap-4 transition-all delay-300 duration-700 ease-out sm:flex-row sm:gap-6 ${
            entered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <Link href="/login" className="pill inline-flex w-full items-center justify-center gap-2 bg-electric px-8 py-4 font-semibold text-white shadow-[0_4px_20px_rgb(32_71_255/0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1A3BDB] hover:shadow-[0_10px_32px_rgb(32_71_255/0.45)] sm:w-auto">
            Start clipping <ArrowRight size={18} />
          </Link>
          <Link href="/brands" className="link-under inline-flex items-center gap-1.5 font-semibold text-ink transition-colors hover:text-electric-deep">
            I&apos;m a brand <ArrowRight size={16} />
          </Link>
        </div>
        {/* compact money math — the concrete payoff, above the fold */}
        <div
          className={`mt-10 inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full border border-ink/12 bg-ink/[0.03] px-6 py-3 text-[15px] transition-all delay-500 duration-700 ease-out ${
            entered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <span className="text-ink-soft">100K views</span>
          <span className="text-ink-faint">×</span>
          <span className="text-ink-soft">$40 per 100K</span>
          <span className="text-ink-faint">=</span>
          <span className="display text-lg text-electric-deep">$40 in your pocket</span>
        </div>
        <p className={`mt-3 text-xs text-ink-faint transition-opacity delay-700 duration-700 ${entered ? "opacity-100" : "opacity-0"}`}>
          Illustrative — each campaign sets its own rate.
        </p>
      </div>

      {/* scroll cue */}
      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-opacity delay-500 duration-700 ${entered ? "opacity-100" : "opacity-0"}`}>
        <div className="flex flex-col items-center gap-2 text-ink-faint">
          <span className="micro-label">Scroll</span>
          <div className="h-8 w-px animate-pulse bg-ink/30" />
        </div>
      </div>
    </header>
  );
}
