"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import MobileMenu from "@/components/MobileMenu";

const LINKS = [
  { href: "/clip", label: "Clippers" },
  { href: "/brands", label: "Brands" },
  { href: "/blog", label: "Blog" },
  { href: "/docs", label: "Docs" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

/**
 * Marketing site chrome (brief §9.1/9.2).
 * Context-aware CTA: "Start clipping" → /login by default,
 * "Start a campaign" → /brand/request on /brands* routes.
 * Explicit props always win (used by pages that need a fixed CTA).
 */
export default function MarketingNav({
  ctaHref,
  ctaLabel,
  signInHref = "/login",
  signInLabel = "Sign in",
}: {
  ctaHref?: string;
  ctaLabel?: string;
  signInHref?: string;
  signInLabel?: string;
}) {
  const pathname = usePathname();
  const onBrands = pathname.startsWith("/brands");
  const effCtaHref = ctaHref ?? (onBrands ? "/brand/request" : "/login");
  const effCtaLabel = ctaLabel ?? (onBrands ? "Start a campaign" : "Start clipping");

  return (
    <nav
      aria-label="Primary"
      className="sticky top-0 z-40 border-b border-line/[0.08] bg-paper/70 backdrop-blur-2xl backdrop-saturate-150"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 lg:px-6">
        <Link
          href="/"
          className="font-display text-lg font-bold tracking-tight text-ink"
          aria-label="ClipForge home"
        >
          CLIPFORGE
        </Link>

        {/* Desktop links — fixed order per brief §9.1 */}
        <div className="hidden items-center gap-8 lg:flex">
          {LINKS.map((l) => {
            const active = isActive(pathname, l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`micro-label transition-colors ${
                  active
                    ? "text-ink underline decoration-[1.5px] underline-offset-[6px]"
                    : "link-under hover:text-ink"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          <ThemeToggle />
          <Link
            href={signInHref}
            className="hidden text-sm font-semibold text-ink-soft transition-colors hover:text-ink lg:block"
          >
            {signInLabel}
          </Link>
          <Link
            href={effCtaHref}
            className="pill min-h-[44px] bg-ink px-4 py-2 text-sm font-semibold text-paper transition-colors duration-micro hover:bg-ink-soft sm:px-5 sm:py-2.5"
          >
            {effCtaLabel}
          </Link>
          <MobileMenu
            signInHref={signInHref}
            signInLabel={signInLabel}
            ctaHref={effCtaHref}
            ctaLabel={effCtaLabel}
          />
        </div>
      </div>
    </nav>
  );
}
