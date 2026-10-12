"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AtSign,
  Clapperboard,
  CreditCard,
  Film,
  Home,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import { signOutAction } from "@/lib/actions";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/campaigns", label: "Campaigns", icon: Clapperboard },
  { href: "/dashboard/clips", label: "Clips", icon: Film },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
  { href: "/dashboard/teams", label: "Teams", icon: Users },
  { href: "/dashboard/accounts", label: "Accounts", icon: AtSign },
];

export type SidebarProfile = {
  displayName: string;
  avatarUrl?: string | null;
};

const itemCls =
  "relative flex min-h-[44px] items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors";

function isActive(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}

/**
 * The dashboard nav content. Rendered by DashboardChrome inside the desktop
 * aside and the mobile drawer — never used directly as a floating element.
 */
export function SidebarNav({
  profile,
  onNavigate,
}: {
  profile: SidebarProfile;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const initial = (profile.displayName || "C").slice(0, 1).toUpperCase();

  return (
    <div className="flex h-full flex-col">
      {/* Profile block — top, links to settings */}
      <Link
        href="/dashboard/settings"
        onClick={onNavigate}
        className="flex min-h-[44px] items-center gap-3 px-4 py-4"
      >
        <span
          aria-hidden
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-semibold text-paper"
        >
          {initial}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-ink">
            {profile.displayName}
          </span>
          <span className="block text-xs text-ink-faint">Clipper account</span>
        </span>
      </Link>

      <div className="mx-4 border-t border-line" aria-hidden />

      {/* Primary nav */}
      <nav aria-label="Dashboard" className="flex-1 px-2 py-3">
        <ul className="space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={`${itemCls} ${
                    active ? "text-ink" : "text-ink-soft hover:bg-ink/5 hover:text-ink"
                  }`}
                >
                  {active && (
                    <span
                      aria-hidden
                      className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-ink"
                    />
                  )}
                  <Icon size={18} aria-hidden />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom: settings + sign out */}
      <div className="border-t border-line px-2 py-3">
        <ul className="space-y-0.5">
          <li>
            <Link
              href="/dashboard/settings"
              onClick={onNavigate}
              aria-current={pathname === "/dashboard/settings" ? "page" : undefined}
              className={`${itemCls} ${
                pathname === "/dashboard/settings"
                  ? "text-ink"
                  : "text-ink-soft hover:bg-ink/5 hover:text-ink"
              }`}
            >
              {pathname === "/dashboard/settings" && (
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-ink"
                />
              )}
              <Settings size={18} aria-hidden />
              Settings
            </Link>
          </li>
          <li>
            <form action={signOutAction}>
              <button
                type="submit"
                className={`${itemCls} w-full text-ink-soft hover:bg-ink/5 hover:text-ink`}
              >
                <LogOut size={18} aria-hidden />
                Sign out
              </button>
            </form>
          </li>
        </ul>
      </div>
    </div>
  );
}
