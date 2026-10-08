"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clapperboard, CreditCard, Home, Settings } from "lucide-react";

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
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-base-900 px-4 py-6">
      <Link href="/brand" className="mb-8 flex items-center gap-2 px-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-lg font-black text-white">
          {brand.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brand.logoUrl} alt="" className="h-9 w-9 rounded-xl object-cover" />
          ) : (
            "C"
          )}
        </span>
        <span className="text-lg font-black tracking-tight text-white">
          CLIPFORGE <span className="ml-1 rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold text-white/60">BRAND</span>
        </span>
      </Link>

      <nav className="flex-1 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/brand" ? pathname === href : pathname.startsWith(href);
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

      <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 text-sm font-bold text-accent-soft">
          {brand.name.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-white">{brand.name}</div>
          <div className="truncate text-xs text-white/40">{brand.contactEmail}</div>
        </div>
      </div>
    </aside>
  );
}
