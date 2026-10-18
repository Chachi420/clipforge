"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Menu } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useDashboardMenu } from "./DashboardChrome";
import { getUnreadNotificationCount } from "@/app/dashboard/notifications/actions";

/**
 * Sticky page header: hamburger (mobile), page H1 + subtitle, then the
 * page-primary action slot, the notifications bell, and the theme toggle.
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
    <header className="sticky top-0 z-30 border-b border-line/10 bg-paper">
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
            <p className="text-sm text-ink-faint">{subtitle}</p>
          )}
        </div>

        {action}

        <NotificationBell />

        <ThemeToggle />
      </div>
    </header>
  );
}

/** Bell linking to the notifications inbox, with an unread-count badge. */
function NotificationBell() {
  const [unread, setUnread] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    getUnreadNotificationCount()
      .then((n) => {
        if (!cancelled) setUnread(n);
      })
      .catch(() => {
        if (!cancelled) setUnread(0);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Link
      href="/dashboard/notifications"
      aria-label={unread ? `${unread} unread notifications` : "Notifications"}
      className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-ink transition-colors hover:bg-ink/5"
    >
      <Bell size={18} aria-hidden />
      {unread != null && unread > 0 && (
        <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-bold leading-none text-paper">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  );
}
