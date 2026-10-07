"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-base-900 px-4 py-6">
      <Link href="/dashboard" className="mb-8 flex items-center gap-2 px-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-lg font-black text-white">C</span>
        <span className="text-lg font-black tracking-tight text-white">
          CLIPFORGE <span className="ml-1 rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold text-white/60">BETA</span>
        </span>
      </Link>

      <nav className="flex-1 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active ? "bg-white/10 text-white" : "text-white/55 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mb-4 rounded-xl border border-white/10 p-3">
        <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-white/40">Feedback</div>
        <div className="flex gap-2">
          <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/5 px-2 py-2 text-xs font-medium text-white/70 hover:bg-white/10">
            <Bug size={14} /> Report bug
          </button>
          <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/5 px-2 py-2 text-xs font-medium text-white/70 hover:bg-white/10">
            <Lightbulb size={14} /> Request feature
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 text-sm font-bold text-accent-soft">
          {profile.displayName.slice(0, 1)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-white">{profile.displayName}</div>
          <div className="truncate text-xs text-white/40">{profile.email}</div>
        </div>
        <Link href="/dashboard/settings" className="text-white/40 hover:text-white" aria-label="Settings">
          <Settings size={16} />
        </Link>
      </div>
    </aside>
  );
}
