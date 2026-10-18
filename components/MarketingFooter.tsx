import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

const COLUMNS: { heading: string; external?: boolean; links: { href: string; label: string }[] }[] = [
  {
    heading: "Product",
    links: [
      { href: "/clip", label: "For Clippers" },
      { href: "/brands", label: "For Brands" },
      { href: "/pricing", label: "Pricing" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/contact", label: "Contact" },
      { href: "/trust", label: "Trust & Safety" },
      { href: "/blog", label: "Blog" },
      { href: "/docs", label: "Docs" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/policies/terms-of-service", label: "Terms" },
      { href: "/policies/privacy-policy", label: "Privacy" },
      { href: "/policies/clipper-terms", label: "Clipper Terms" },
      { href: "/policies/grievance-officer", label: "Grievance Officer" },
    ],
  },
  {
    heading: "Account",
    links: [
      { href: "/login", label: "Sign in" },
      { href: "/brand/login", label: "Brand sign in" },
    ],
  },
  {
    heading: "Ask AI",
    external: true,
    links: [
      { href: "https://chatgpt.com/?q=What+is+ClipForge+clipping+marketplace", label: "ChatGPT" },
      { href: "https://claude.ai/new?q=What+is+ClipForge+clipping+marketplace", label: "Claude" },
      { href: "https://gemini.google.com/", label: "Gemini" },
      { href: "https://www.perplexity.ai/search?q=What+is+ClipForge+clipping+marketplace", label: "Perplexity" },
    ],
  },
];

/**
 * Marketing footer (brief §9.3). Five link columns, monochrome, small type.
 * No dead links, no social icons, no newsletter box.
 */
export default function MarketingFooter() {
  return (
    <footer className="border-t border-white/10 bg-black text-white/60">
      <div className="mx-auto max-w-6xl px-6 py-12 lg:py-16">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {COLUMNS.map((col) => (
            <nav key={col.heading} aria-label={`Footer — ${col.heading}`}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-white/40">
                {col.heading}
              </h2>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    {col.external ? (
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[32px] items-center text-sm text-white/60 transition-colors hover:text-white"
                      >
                        {l.label}
                      </a>
                    ) : (
                      <Link
                        href={l.href}
                        className="inline-flex min-h-[32px] items-center text-sm text-white/60 transition-colors hover:text-white"
                      >
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-6 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-white/40">© 2026 ClipForge</p>
          <div className="lg:hidden">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
