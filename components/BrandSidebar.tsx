"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clapperboard, CreditCard, Home, Settings } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const NAV = [
  { href: "/brand", label: "Overview", icon: Home },
  { href: "/brand/campaigns", label: "Campaigns", icon: Clapperboard },
  { href: "/brand/billing", label: "Billing", icon: CreditCard },
  { href: "/brand/settings", label: "Settings", icon: Settings },
];

export default function BrandSidebar({
  brand,
}: {
  brand: { name: string; contactEmail: string; logoUrl: string };
}) {
  const pathname = usePathname();
  return (
    <aside className="glass flex h-screen w-64 shrink-0 flex-col border-r border-line/10 px-4 py-6">
      <Link href="/brand" className="mb-8 flex items-center gap-2 px-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-lime text-lg font-black text-ink">
          {brand.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brand.logoUrl} alt="" className="h-9 w-9 rounded-xl object-cover" />
          ) : (
            "C"
          )}
        </span>
        <span className="text-lg font-black tracking-tight text-ink">
          CLIPFORGE <span className="ml-1 rounded bg-ink/10 px-1.5 py-0.5 text-[10px] font-bold text-ink-soft">BRAND</span>
        </span>
      </Link>

      <nav className="flex-1 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/brand" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-lime font-semibold text-ink shadow-card"
                  : "text-ink-soft hover:bg-ink/5 hover:text-ink"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
            Theme
          </span>
          <ThemeToggle />
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-ink/5 p-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-lime text-sm font-bold text-ink">
            {brand.name.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-ink">{brand.name}</div>
            <div className="truncate text-xs text-ink-faint">{brand.contactEmail}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
