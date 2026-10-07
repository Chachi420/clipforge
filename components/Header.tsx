"use client";
import { useState } from "react";
import { Bell, Moon, Search, Sun } from "lucide-react";

export default function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const [dark, setDark] = useState(true);
  const [showNotes, setShowNotes] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-base-950/90 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-8">
        <div>
          <h1 className="text-xl font-bold text-white">{title}</h1>
          {subtitle && <p className="text-sm text-white/50">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              placeholder="Search…"
              className="w-56 rounded-xl border border-white/10 bg-base-850 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-accent/60"
            />
          </div>
          <button
            onClick={() => { setDark(!dark); document.documentElement.classList.toggle("dark", !dark); }}
            className="rounded-xl border border-white/10 p-2.5 text-white/60 hover:bg-white/5 hover:text-white"
            aria-label="Toggle theme"
          >
            {dark ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <div className="relative">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="relative rounded-xl border border-white/10 p-2.5 text-white/60 hover:bg-white/5 hover:text-white"
              aria-label="Notifications"
            >
              <Bell size={16} />
            </button>
            {showNotes && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-white/10 bg-base-850 p-4 shadow-2xl">
                <div className="mb-2 text-sm font-bold text-white">You're all caught up</div>
                <p className="text-xs text-white/50">Updates about your payouts will show up here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
