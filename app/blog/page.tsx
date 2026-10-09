"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { Card, Badge } from "@/components/ui";
import { BLOG_POSTS, BLOG_CATEGORIES } from "@/lib/blog-posts";

export default function BlogIndex() {
  const [filter, setFilter] = useState<string>("All");
  const posts =
    filter === "All" ? BLOG_POSTS : BLOG_POSTS.filter((p) => p.category === filter);

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
              href="/docs"
              className="text-sm font-semibold text-ink-soft hover:text-ink"
            >
              Docs
            </Link>
            <Link
              href="/login"
              className="pill bg-electric px-5 py-2.5 text-sm font-bold text-white hover:bg-electric-soft"
            >
              Start clipping
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 pb-20">
        <header className="py-12">
          <div className="text-xs font-bold uppercase tracking-[0.3em] text-electric-deep">
            Blog
          </div>
          <h1 className="display mt-3 text-4xl md:text-5xl">Learn &amp; Earn</h1>
          <p className="mt-4 max-w-xl text-lg text-ink-soft">
            Guides to making money as a clipper.
          </p>
        </header>

        <div className="flex flex-wrap gap-2">
          {["All", ...BLOG_CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filter === c
                  ? "bg-electric text-white"
                  : "border border-line/15 text-ink-soft hover:bg-ink/5 hover:text-ink"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <Card className="group flex h-full flex-col p-8 transition hover:border-electric/40">
                <div className="flex items-center gap-3">
                  <Badge tone="blue">{post.category}</Badge>
                  <span className="flex items-center gap-1.5 text-xs text-ink-faint">
                    <Clock size={13} /> {post.readTime}
                  </span>
                </div>
                <h2 className="mt-4 font-display text-2xl font-bold leading-snug tracking-tight group-hover:text-electric-deep">
                  {post.title}
                </h2>
                <p className="mt-3 flex-1 text-ink-soft">{post.excerpt}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-electric-deep">
                  Read guide <ArrowRight size={16} />
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </main>

      <footer className="border-t border-line/10 py-8 text-center text-sm text-ink-faint">
        ClipForge — a demo rebuild for product research.
      </footer>
    </div>
  );
}
