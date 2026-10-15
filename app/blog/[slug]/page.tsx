import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import MarketingNav from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/marketing";
import { Badge } from "@/components/ui";
import { BLOG_POSTS, getBlogPost } from "@/lib/blog-posts";

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = getBlogPost(params.slug);
  if (!post) return { title: "Post not found — ClipForge" };
  return {
    title: `${post.title} — ClipForge Blog`,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
  };
}

/**
 * Blog article (brief §11). Clean reading column, prev/next navigation,
 * contextual CTA. No fake dates or author bylines.
 */
export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogPost(params.slug);
  if (!post) {
    return (
      <div className="min-h-screen bg-paper text-ink">
        <MarketingNav />
        <main className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h1 className="display text-3xl">Post not found</h1>
          <Link
            href="/blog"
            className="mt-6 inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-ink-soft hover:text-ink"
          >
            <ArrowLeft size={16} aria-hidden /> Back to blog
          </Link>
        </main>
        <MarketingFooter />
      </div>
    );
  }

  const idx = BLOG_POSTS.findIndex((p) => p.slug === post.slug);
  const prev = idx > 0 ? BLOG_POSTS[idx - 1] : null;
  const next = idx < BLOG_POSTS.length - 1 ? BLOG_POSTS[idx + 1] : null;

  return (
    <div className="min-h-screen bg-paper text-ink">
      <MarketingNav />

      <main className="mx-auto max-w-3xl px-6 pb-24">
        <Link
          href="/blog"
          className="inline-flex min-h-[44px] items-center gap-2 pt-10 text-sm font-semibold text-ink-faint transition-colors hover:text-ink"
        >
          <ArrowLeft size={16} aria-hidden /> Back to blog
        </Link>

        <article className="mt-6">
          <div className="flex items-center gap-3">
            <Badge>{post.category}</Badge>
            <span className="flex items-center gap-1.5 text-xs text-ink-faint">
              <Clock size={13} aria-hidden /> {post.readTime}
            </span>
          </div>
          <h1 className="display mt-4 text-[clamp(2rem,6vw,3.5rem)] leading-[1.05]">
            {post.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">{post.excerpt}</p>
          <div className="mt-8 border-t border-line/10 pt-8">{post.content}</div>
        </article>

        {/* Prev / next */}
        <nav
          aria-label="More guides"
          className="mt-16 grid gap-4 border-t border-line/10 pt-8 sm:grid-cols-2"
        >
          {prev ? (
            <Link
              href={`/blog/${prev.slug}`}
              className="group rounded-card border border-line/10 bg-surface p-6 transition-colors duration-micro hover:border-ink/30"
            >
              <span className="micro-label">Previous</span>
              <span className="display mt-2 block text-lg leading-snug">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/blog/${next.slug}`}
              className="group rounded-card border border-line/10 bg-surface p-6 text-right transition-colors duration-micro hover:border-ink/30"
            >
              <span className="micro-label">Next</span>
              <span className="display mt-2 block text-lg leading-snug">{next.title}</span>
            </Link>
          ) : (
            <span />
          )}
        </nav>

        {/* Contextual CTA */}
        <div className="mt-12 rounded-card bg-black p-8 text-center text-white md:p-10">
          <h2 className="display text-2xl text-white md:text-3xl">
            Ready to put this into practice?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-white/60">
            Join free, verify an account, and post your first clip.
          </p>
          <Link
            href="/login"
            className="pill mt-6 inline-flex min-h-[44px] bg-white px-7 py-3 text-sm font-semibold text-black transition-colors duration-micro hover:bg-white/85"
          >
            Start clipping <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
