"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronDown, Menu, Search, X } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import MarketingNav from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/marketing";
import { DOCS_NAV, getDocsArticle } from "@/lib/docs-articles";

export default function DocsShell({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const article = getDocsArticle(slug);

  const q = filter.trim().toLowerCase();
  const sections = DOCS_NAV.map((section) => ({
    ...section,
    articles: section.articles.filter(
      (a) =>
        !q ||
        a.title.toLowerCase().includes(q) ||
        section.title.toLowerCase().includes(q)
    ),
  })).filter((s) => s.articles.length > 0);

  const nav = (
    <nav className="space-y-6" aria-label="Docs contents">
      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
          aria-hidden
        />
        <input
          type="search"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter guides…"
          aria-label="Filter guides"
          className="w-full rounded-md border border-line/15 bg-surface py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint/70 outline-none transition-colors duration-micro focus:border-ink/40"
        />
      </div>
      {sections.length === 0 && (
        <p className="text-sm text-ink-faint">No guides match &ldquo;{filter}&rdquo;.</p>
      )}
      {sections.map((section) => (
        <div key={section.title}>
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-faint">
            {section.title}
          </div>
          <ul className="space-y-1">
            {section.articles.map((a) => (
              <li key={a.slug}>
                <Link
                  href={a.slug === "welcome" ? "/docs" : `/docs/${a.slug}`}
                  onClick={() => setOpen(false)}
                  aria-current={a.slug === slug ? "page" : undefined}
                  className={`block rounded-md px-3 py-2 text-sm transition-colors duration-micro ${
                    a.slug === slug
                      ? "bg-ink/[0.07] font-semibold text-ink"
                      : "text-ink-soft hover:bg-ink/5 hover:text-ink"
                  }`}
                >
                  {a.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );

  const isIndex = slug === "welcome";

  return (
    <div className="min-h-screen bg-paper text-ink">
      <MarketingNav />

      <main className="mx-auto max-w-6xl px-6 pb-20">
        <header className="flex items-center justify-between py-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-ink-faint">
              <BookOpen size={14} aria-hidden /> Docs
            </div>
            {isIndex ? (
              <h1 className="display mt-3 text-3xl md:text-4xl">Wondeed guides</h1>
            ) : (
              <div className="display mt-3 text-3xl md:text-4xl">
                Wondeed guides
              </div>
            )}
          </div>
          <button
            onClick={() => setOpen(!open)}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-md border border-line/15 px-4 py-2 text-sm font-semibold text-ink-soft md:hidden"
            aria-expanded={open}
          >
            {open ? <X size={16} aria-hidden /> : <Menu size={16} aria-hidden />} Contents
          </button>
        </header>

        {open && (
          <div className="mb-6 rounded-card border border-line/10 bg-surface p-6 md:hidden">
            {nav}
          </div>
        )}

        <div className="flex gap-10">
          <aside className="hidden w-64 shrink-0 md:block">
            <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">{nav}</div>
          </aside>

          <article className="min-w-0 flex-1">
            {article ? (
              <>
                <div className="text-xs font-bold uppercase tracking-wider text-ink-faint">
                  {article.section}
                </div>
                <h1 className="display mt-2 text-3xl md:text-4xl">{article.title}</h1>
                <div className="mt-2 max-w-prose">{article.body}</div>

                <div className="mt-12 flex items-center justify-between border-t border-line/10 pt-6">
                  <DocPager slug={slug} dir={-1} />
                  <DocPager slug={slug} dir={1} />
                </div>
              </>
            ) : (
              <div>
                <h2 className="display text-2xl">Article not found</h2>
                <p className="mt-2 text-ink-soft">
                  Pick a guide from the contents to keep reading.
                </p>
              </div>
            )}
          </article>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}

function DocPager({ slug, dir }: { slug: string; dir: -1 | 1 }) {
  const flat = DOCS_NAV.flatMap((s) => s.articles);
  const idx = flat.findIndex((a) => a.slug === slug);
  const target = flat[idx + dir];
  if (!target) return <span />;
  const href = target.slug === "welcome" ? "/docs" : `/docs/${target.slug}`;
  return (
    <Link
      href={href}
      className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-ink-faint transition-colors hover:text-ink"
    >
      {dir === -1 ? (
        <>
          <ChevronDown className="rotate-90" size={16} /> {target.title}
        </>
      ) : (
        <>
          {target.title} <ChevronDown className="-rotate-90" size={16} />
        </>
      )}
    </Link>
  );
}
