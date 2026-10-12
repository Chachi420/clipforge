"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clapperboard, CreditCard, Home, LogOut, Settings } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { signOutAction } from "@/lib/actions";

const NAV = [
  { href: "/brand", label: "Overview", icon: Home },
  { href: "/brand/campaigns", label: "Campaigns", icon: Clapperboard },
  { href: "/brand/billing", label: "Billing", icon: CreditCard },
];

/**
 * Brand sidebar — 240px, same background as content, 1px right border.
 * Brief §9.5: brand mark top → /brand; Overview / Campaigns / Billing;
 * Settings + Sign out pinned bottom. Active = tonal background + ink text.
 */
export default function BrandSidebar({
  brand,
}: {
  brand: { name: string; contactEmail: string; logoUrl: string };
}) {
  const pathname = usePathname();
  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-line/10 bg-paper px-3 py-6">
      <Link href="/brand" className="mb-8 flex items-center gap-2.5 px-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink text-base font-black text-paper">
          {brand.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brand.logoUrl} alt="" className="h-9 w-9 rounded-lg object-cover" />
          ) : (
            brand.name.slice(0, 1).toUpperCase()
          )}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold tracking-tight text-ink">
            {brand.name}
          </span>
          <span className="micro-label">Brand</span>
        </span>
      </Link>

      <nav className="flex-1 space-y-1" aria-label="Brand">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/brand" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-ink/[0.06] font-semibold text-ink"
                  : "text-ink-soft hover:bg-ink/[0.04] hover:text-ink"
              }`}
            >
              <Icon size={18} aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-line/10 pt-3">
        <Link
          href="/brand/settings"
          aria-current={pathname === "/brand/settings" ? "page" : undefined}
          className={`flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
            pathname === "/brand/settings"
              ? "bg-ink/[0.06] font-semibold text-ink"
              : "text-ink-soft hover:bg-ink/[0.04] hover:text-ink"
          }`}
        >
          <Settings size={18} aria-hidden />
          Settings
        </Link>
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex min-h-[44px] w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink-soft transition-colors hover:bg-ink/[0.04] hover:text-ink"
          >
            <LogOut size={18} aria-hidden />
            Sign out
          </button>
        </form>
        <div className="flex items-center justify-between px-3 pt-2">
          <span className="micro-label">Theme</span>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
