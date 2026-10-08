"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronDown, Menu, X } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { DOCS_NAV, getDocsArticle } from "@/lib/docs-articles";

export default function DocsShell({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const article = getDocsArticle(slug);

  const nav = (
    <nav className="space-y-6">
      {DOCS_NAV.map((section) => (
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
                  className={`block rounded-xl px-3 py-2 text-sm transition ${
                    a.slug === slug
                      ? "bg-lime/15 font-semibold text-lime-deep"
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

  return (
    <div className="min-h-screen bg-paper text-ink">
      <nav className="sticky top-0 z-40 border-b border-line/10 bg-paper/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-display text-xl font-bold tracking-tight">
            CLIPFORGE
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/blog"
              className="text-sm font-semibold text-ink-soft hover:text-ink"
            >
              Blog
            </Link>
            <Link
              href="/login"
              className="pill bg-lime px-5 py-2.5 text-sm font-bold text-ink hover:bg-lime-soft"
            >
              Start clipping
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 pb-20">
        <header className="flex items-center justify-between py-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-lime-deep">
              <BookOpen size={14} /> Docs
            </div>
            <h1 className="display mt-2 text-3xl md:text-4xl">ClipForge Guides</h1>
          </div>
          <button
            onClick={() => setOpen(!open)}
            className="inline-flex items-center gap-2 rounded-xl border border-line/15 px-4 py-2 text-sm font-semibold text-ink-soft md:hidden"
          >
            {open ? <X size={16} /> : <Menu size={16} />} Contents
          </button>
        </header>

        {open && (
          <div className="glass mb-6 rounded-3xl p-6 md:hidden">
            {nav}
          </div>
        )}

        <div className="flex gap-10">
          <aside className="hidden w-64 shrink-0 md:block">
            <div className="sticky top-6">{nav}</div>
          </aside>

          <article className="min-w-0 flex-1">
            {article ? (
              <>
                <div className="text-xs font-bold uppercase tracking-wider text-ink-faint">
                  {article.section}
                </div>
                <h2 className="display mt-2 text-3xl md:text-4xl">{article.title}</h2>
                <div className="mt-2">{article.body}</div>

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

      <footer className="border-t border-line/10 py-8 text-center text-sm text-ink-faint">
        ClipForge — a demo rebuild for product research.
      </footer>
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
      className="inline-flex items-center gap-2 text-sm font-semibold text-ink-faint hover:text-lime-deep"
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
