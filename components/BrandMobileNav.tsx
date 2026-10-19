"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Clapperboard, CreditCard, Home, LogOut, Menu, Settings, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { signOutAction } from "@/lib/actions";

const NAV = [
  { href: "/brand", label: "Overview", icon: Home },
  { href: "/brand/campaigns", label: "Campaigns", icon: Clapperboard },
  { href: "/brand/billing", label: "Billing", icon: CreditCard },
  { href: "/brand/settings", label: "Settings", icon: Settings },
];

/**
 * Brand mobile chrome: slim top bar (logo + theme + hamburger) that opens
 * a full overlay drawer. Brief §9.5 — same drawer rules as the clipper app:
 * closes on navigate, Escape closes, body scroll locked, 44px+ targets.
 */
export default function BrandMobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", fn);
      document.body.style.overflow = "";
    };
  }, [open ]);

  return (
    <>
      <div className="sticky top-0 z-40 border-b border-line/10 bg-paper lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/brand" className="flex items-center gap-2" aria-label="Wondeed brand home">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-sm font-black text-paper">
              C
            </span>
            <span className="text-sm font-bold tracking-tight text-ink">
              WONDEED <span className="micro-label ml-1">Brand</span>
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              onClick={() => setOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5"
              aria-label="Open menu"
              aria-expanded={open}
            >
              <Menu size={20} aria-hidden />
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Brand menu">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-paper px-4 py-6 shadow-none">
            <div className="mb-6 flex items-center justify-between px-2">
              <span className="text-sm font-bold tracking-tight text-ink">
                WONDEED <span className="micro-label ml-1">Brand</span>
              </span>
              <button
                onClick={() => setOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5"
                aria-label="Close menu"
              >
                <X size={20} aria-hidden />
              </button>
            </div>
            <nav className="flex-1 space-y-1" aria-label="Brand">
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = href === "/brand" ? pathname === href : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-3 text-base transition-colors ${
                      active
                        ? "bg-ink/[0.06] font-semibold text-ink"
                        : "text-ink-soft hover:bg-ink/[0.04] hover:text-ink"
                    }`}
                  >
                    <Icon size={20} aria-hidden />
                    {label}
                  </Link>
                );
              })}
            </nav>
            <form action={signOutAction} className="border-t border-line/10 pt-3">
              <button
                type="submit"
                className="flex min-h-[44px] w-full items-center gap-3 rounded-lg px-3 py-3 text-base text-ink-soft transition-colors hover:bg-ink/[0.04] hover:text-ink"
              >
                <LogOut size={20} aria-hidden />
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
