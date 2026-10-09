"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Clapperboard, CreditCard, Home, Lightbulb, Users, Wallet,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const NAV = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/campaigns", label: "Campaigns", icon: Clapperboard },
  { href: "/dashboard/clips", label: "Clips", icon: Wallet },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
  { href: "/dashboard/teams", label: "Teams", icon: Users },
  { href: "/dashboard/accounts", label: "Accounts", icon: Lightbulb },
];

/** Horizontal nav shown on small screens where the sidebar is hidden. */
export default function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="sticky top-0 z-40 border-b border-line/10 bg-paper/90 backdrop-blur-xl lg:hidden">
      <div className="flex items-center gap-1 overflow-x-auto px-3 py-2">
        <Link href="/dashboard" className="mr-2 flex shrink-0 items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-electric text-base font-black text-white">C</span>
        </Link>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition ${
                active ? "bg-electric text-white shadow-card" : "text-ink-soft hover:text-ink"
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
        <div className="ml-auto shrink-0 pl-2">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
