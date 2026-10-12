"use client";

import { Bell, Menu } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useDashboardMenu } from "./DashboardChrome";

/**
 * Sticky page header: hamburger (mobile), page H1 + subtitle, then the
 * page-primary action slot, a reserved (disabled) notifications bell, and
 * the theme toggle.
 */
export default function Header({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  const { openMenu, menuButtonRef } = useDashboardMenu();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper">
      <div className="flex min-h-[64px] items-center gap-2 px-4 sm:gap-3 sm:px-6">
        <button
          ref={(el) => {
            menuButtonRef.current = el;
          }}
          onClick={openMenu}
          aria-label="Open menu"
          className="-ml-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-ink hover:bg-ink/5 lg:hidden"
        >
          <Menu size={20} aria-hidden />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="display truncate text-xl text-ink">{title}</h1>
          {subtitle && (
            <p className="truncate text-sm text-ink-faint">{subtitle}</p>
          )}
        </div>

        {action}

        {/* Notifications: slot reserved for Phase 2. Bell is present but disabled. */}
        <button
          disabled
          aria-label="Notifications — coming soon"
          title="Notifications — coming soon"
          className="flex h-11 w-11 shrink-0 cursor-not-allowed items-center justify-center rounded-md text-ink-faint opacity-60"
        >
          <Bell size={18} aria-hidden />
        </button>

        <ThemeToggle />
      </div>
    </header>
  );
}
