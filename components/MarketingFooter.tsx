import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

const COLUMNS: { heading: string; links: { href: string; label: string }[] }[] = [
  {
    heading: "Product",
    links: [
      { href: "/clip", label: "For Clippers" },
      { href: "/brands", label: "For Brands" },
      { href: "/blog", label: "Blog" },
      { href: "/docs", label: "Docs" },
    ],
  },
  {
    heading: "Company",
    links: [{ href: "/contact", label: "Contact" }],
  },
  {
    heading: "Legal",
    links: [
      { href: "/policies/terms-of-service", label: "Terms" },
      { href: "/policies/privacy-policy", label: "Privacy" },
      { href: "/policies/clipper-terms", label: "Clipper Terms" },
    ],
  },
  {
    heading: "Account",
    links: [
      { href: "/login", label: "Sign in" },
      { href: "/brand/login", label: "Brand sign in" },
    ],
  },
];

/**
 * Marketing footer (brief §9.3). Four link columns, monochrome, small type.
 * No dead links, no social icons, no newsletter box.
 */
export default function MarketingFooter() {
  return (
    <footer className="border-t border-white/10 bg-black text-white/60">
      <div className="mx-auto max-w-6xl px-6 py-12 lg:py-16">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {COLUMNS.map((col) => (
            <nav key={col.heading} aria-label={`Footer — ${col.heading}`}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-white/40">
                {col.heading}
              </h2>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="inline-flex min-h-[32px] items-center text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 flex items-center justify-between border-t border-white/10 pt-6">
          <p className="text-sm text-white/40">© 2026 ClipForge</p>
          <div className="lg:hidden">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
