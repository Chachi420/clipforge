"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import MarketingNav from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/marketing";
import { Card, Badge } from "@/components/ui";
import { BLOG_POSTS, BLOG_CATEGORIES } from "@/lib/blog-posts";

/**
 * Blog index (brief §11). One honest H1: "Blog". Category chips filter
 * the list. Cards show title, excerpt, category, reading time — no fake
 * dates or author avatars.
 */
export default function BlogIndex() {
  const [filter, setFilter] = useState<string>("All");
  const posts =
    filter === "All" ? BLOG_POSTS : BLOG_POSTS.filter((p) => p.category === filter);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <MarketingNav />

      <main className="mx-auto max-w-6xl px-6 pb-24">
        <header className="py-14 md:py-20">
          <h1 className="display text-[clamp(2.75rem,8vw,5.5rem)] leading-[0.95]">Blog</h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">
            Clipping guides and playbooks — how to earn more per clip, and how
            the marketplace works.
          </p>
        </header>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {["All", ...BLOG_CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              aria-pressed={filter === c}
              className={`min-h-[44px] rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-micro ${
                filter === c
                  ? "bg-ink text-paper"
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
              <Card className="group flex h-full flex-col p-8 transition-colors duration-micro hover:border-ink/30">
                <div className="flex items-center gap-3">
                  <Badge>{post.category}</Badge>
                  <span className="flex items-center gap-1.5 text-xs text-ink-faint">
                    <Clock size={13} aria-hidden /> {post.readTime}
                  </span>
                </div>
                <h2 className="display mt-4 text-2xl leading-snug">
                  {post.title}
                </h2>
                <p className="mt-3 flex-1 leading-relaxed text-ink-soft">{post.excerpt}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ink">
                  Read guide <ArrowRight size={16} aria-hidden />
                </span>
              </Card>
            </Link>
          ))}
        </div>

        {posts.length === 0 && (
          <p className="mt-8 text-ink-faint">No posts in this category yet.</p>
        )}
      </main>

      <MarketingFooter />
    </div>
  );
}
