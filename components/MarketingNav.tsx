import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import MobileMenu from "@/components/MobileMenu";

const LINKS = [
  { href: "/clip", label: "Clippers" },
  { href: "/brands", label: "Brands" },
  { href: "/blog", label: "Blog" },
  { href: "/docs", label: "Docs" },
];

export default function MarketingNav({
  ctaHref = "/login",
  ctaLabel = "Start clipping",
  signInHref = "/login",
  signInLabel = "Sign in",
}: {
  ctaHref?: string;
  ctaLabel?: string;
  signInHref?: string;
  signInLabel?: string;
}) {
  return (
    <nav className="sticky top-0 z-40 border-b border-line/[0.07] bg-paper/60 backdrop-blur-2xl backdrop-saturate-150">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between px-5 py-3 md:px-6 md:py-3.5">
        <Link href="/" className="font-display text-lg font-bold tracking-tight">
          CLIPFORGE
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="micro-label link-under hover:text-ink">
              {l.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <ThemeToggle />
          <Link
            href={signInHref}
            className="hidden text-sm font-semibold text-ink-soft transition-colors hover:text-ink sm:block"
          >
            {signInLabel}
          </Link>
          <Link
            href={ctaHref}
            className="pill bg-ink px-5 py-2.5 text-sm font-semibold text-paper shadow-[0_2px_12px_rgb(7_11_20/0.18)] transition-all duration-200 hover:-translate-y-px hover:bg-ink-soft hover:shadow-[0_6px_20px_rgb(7_11_20/0.22)]"
          >
            {ctaLabel}
          </Link>
          <MobileMenu signInHref={signInHref} />
        </div>
      </div>
    </nav>
  );
}
