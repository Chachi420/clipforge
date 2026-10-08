"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronDown, Menu, X } from "lucide-react";
import { DOCS_NAV, getDocsArticle } from "@/lib/docs-articles";

export default function DocsShell({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const article = getDocsArticle(slug);

  const nav = (
    <nav className="space-y-6">
      {DOCS_NAV.map((section) => (
        <div key={section.title}>
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-white/40">
            {section.title}
          </div>
          <ul className="space-y-1">
            {section.articles.map((a) => (
              <li key={a.slug}>
                <Link
                  href={a.slug === "welcome" ? "/docs" : `/docs/${a.slug}`}
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg px-3 py-2 text-sm transition ${
                    a.slug === slug
                      ? "bg-accent/15 font-semibold text-accent-soft"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
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
    <div className="min-h-screen bg-base-950">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="text-xl font-black tracking-tight">
          CLIPFORGE
        </Link>
        <div className="flex gap-3">
          <Link
            href="/blog"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-white/70 hover:text-white"
          >
            Blog
          </Link>
          <Link
            href="/login"
            className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-soft"
          >
            Start clipping
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 pb-20">
        <header className="flex items-center justify-between py-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-accent-soft">
              <BookOpen size={14} /> Docs
            </div>
            <h1 className="mt-2 text-3xl font-black">ClipForge Guides</h1>
          </div>
          <button
            onClick={() => setOpen(!open)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white/70 md:hidden"
          >
            {open ? <X size={16} /> : <Menu size={16} />} Contents
          </button>
        </header>

        {open && (
          <div className="mb-6 rounded-2xl border border-white/10 bg-base-850 p-6 md:hidden">
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
                <div className="text-xs font-bold uppercase tracking-wider text-white/40">
                  {article.section}
                </div>
                <h2 className="mt-2 text-3xl font-black">{article.title}</h2>
                <div className="mt-2">{article.body}</div>

                <div className="mt-12 flex items-center justify-between border-t border-white/10 pt-6">
                  <DocPager slug={slug} dir={-1} />
                  <DocPager slug={slug} dir={1} />
                </div>
              </>
            ) : (
              <div>
                <h2 className="text-2xl font-black">Article not found</h2>
                <p className="mt-2 text-white/60">
                  Pick a guide from the contents to keep reading.
                </p>
              </div>
            )}
          </article>
        </div>
      </main>

      <footer className="border-t border-white/10 py-8 text-center text-sm text-white/40">
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
      className="inline-flex items-center gap-2 text-sm font-semibold text-white/50 hover:text-accent-soft"
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
