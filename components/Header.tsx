"use client";
import { useState } from "react";
import { Bell, Search } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const [showNotes, setShowNotes] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-line/10 bg-paper/85 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-8">
        <div>
          <h1 className="display text-xl">{title}</h1>
          {subtitle && <p className="text-sm text-ink-faint">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              placeholder="Search…"
              className="w-56 rounded-full border border-line/15 bg-surface/70 py-2 pl-9 pr-3 text-sm text-ink outline-none backdrop-blur placeholder:text-ink-faint focus:border-lime-deep/50"
            />
          </div>
          <ThemeToggle />
          <div className="relative">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="glass inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition hover:text-ink"
              aria-label="Notifications"
            >
              <Bell size={16} />
            </button>
            {showNotes && (
              <div className="glass glass-sheen absolute right-0 z-50 mt-2 w-80 rounded-3xl p-4 shadow-card-lg">
                <div className="mb-2 text-sm font-bold text-ink">You&apos;re all caught up</div>
                <p className="text-xs text-ink-faint">Updates about your payouts will show up here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
