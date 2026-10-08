"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { Card, Badge } from "@/components/ui";
import { BLOG_POSTS, BLOG_CATEGORIES } from "@/lib/blog-posts";

export default function BlogIndex() {
  const [filter, setFilter] = useState<string>("All");
  const posts =
    filter === "All" ? BLOG_POSTS : BLOG_POSTS.filter((p) => p.category === filter);

  return (
    <div className="min-h-screen bg-base-950">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="text-xl font-black tracking-tight">
          CLIPFORGE
        </Link>
        <div className="flex gap-3">
          <Link
            href="/docs"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-white/70 hover:text-white"
          >
            Docs
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
        <header className="py-12">
          <div className="text-xs font-bold uppercase tracking-[0.3em] text-accent-soft">
            Blog
          </div>
          <h1 className="mt-3 text-4xl font-black md:text-5xl">Learn &amp; Earn</h1>
          <p className="mt-4 max-w-xl text-lg text-white/60">
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
                  ? "bg-accent text-white"
                  : "border border-white/15 text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <Card className="group flex h-full flex-col p-8 transition hover:border-accent/40">
                <div className="flex items-center gap-3">
                  <Badge tone="blue">{post.category}</Badge>
                  <span className="flex items-center gap-1.5 text-xs text-white/40">
                    <Clock size={13} /> {post.readTime}
                  </span>
                </div>
                <h2 className="mt-4 text-2xl font-bold leading-snug group-hover:text-accent-soft">
                  {post.title}
                </h2>
                <p className="mt-3 flex-1 text-white/60">{post.excerpt}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent-soft">
                  Read guide <ArrowRight size={16} />
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </main>

      <footer className="border-t border-white/10 py-8 text-center text-sm text-white/40">
        ClipForge — a demo rebuild for product research.
      </footer>
    </div>
  );
}
