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

/** Horizontal nav shown on small screens where the brand sidebar is hidden. */
export default function BrandMobileNav() {
  const pathname = usePathname();
  return (
    <nav className="glass sticky top-0 z-40 border-b border-line/10 lg:hidden">
      <div className="flex items-center gap-1 overflow-x-auto px-3 py-2">
        <Link href="/brand" className="mr-2 flex shrink-0 items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-electric text-base font-black text-white">C</span>
        </Link>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/brand" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition ${
                active ? "bg-electric font-semibold text-white" : "text-ink-soft hover:text-ink"
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
        <div className="ml-auto shrink-0 pl-1">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
