"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import {
  Bug, Clapperboard, CreditCard, Home, Lightbulb, Settings, Users, Wallet,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/campaigns", label: "Campaigns", icon: Clapperboard },
  { href: "/dashboard/clips", label: "Clips", icon: Wallet },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
  { href: "/dashboard/teams", label: "Teams", icon: Users },
  { href: "/dashboard/accounts", label: "Accounts", icon: Lightbulb },
];

export default function Sidebar({
  profile,
}: {
  profile: { displayName: string; email: string; avatarUrl: string };
}) {
  const pathname = usePathname();
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-line/10 bg-surface/70 px-4 py-6 backdrop-blur-xl">
      <Link href="/dashboard" className="mb-8 flex items-center gap-2 px-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-electric text-lg font-black text-white">C</span>
        <span className="text-lg font-black tracking-tight text-ink">
          CLIPFORGE <span className="ml-1 rounded bg-ink/10 px-1.5 py-0.5 text-[10px] font-bold text-ink-faint">BETA</span>
        </span>
      </Link>

      <nav className="flex-1 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`pill justify-start px-4 py-2.5 text-sm transition ${
                active ? "bg-electric text-white shadow-card" : "text-ink-soft hover:bg-ink/5 hover:text-ink"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mb-4 rounded-2xl border border-line/10 bg-surface-deep/60 p-3">
        <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-faint">Feedback</div>
        <div className="flex gap-2">
          <button className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-ink/5 px-2 py-2 text-xs font-medium text-ink-soft hover:bg-ink/10">
            <Bug size={14} /> Report bug
          </button>
          <button className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-ink/5 px-2 py-2 text-xs font-medium text-ink-soft hover:bg-ink/10">
            <Lightbulb size={14} /> Request feature
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-line/10 bg-surface/80 p-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-electric/25 text-sm font-bold text-electric-deep">
          {profile.displayName.slice(0, 1)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-ink">{profile.displayName}</div>
          <div className="truncate text-xs text-ink-faint">{profile.email}</div>
        </div>
        <Link href="/dashboard/settings" className="text-ink-faint hover:text-ink" aria-label="Settings">
          <Settings size={16} />
        </Link>
        <ThemeToggle />
      </div>
    </aside>
  );
}
