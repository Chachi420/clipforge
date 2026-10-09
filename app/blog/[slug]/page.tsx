import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { Badge } from "@/components/ui";
import { BLOG_POSTS, getBlogPost } from "@/lib/blog-posts";

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogPost(params.slug);
  if (!post) {
    return (
      <div className="min-h-screen bg-paper text-ink">
        <main className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h1 className="display text-3xl">Post not found</h1>
          <Link
            href="/blog"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-electric-deep"
          >
            <ArrowLeft size={16} /> Back to blog
          </Link>
        </main>
      </div>
    );
  }

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
              href="/login"
              className="pill bg-electric px-5 py-2.5 text-sm font-bold text-white hover:bg-electric-soft"
            >
              Start clipping
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-6 pb-20">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-semibold text-ink-faint hover:text-ink"
        >
          <ArrowLeft size={16} /> Back to blog
        </Link>

        <article className="mt-8">
          <div className="flex items-center gap-3">
            <Badge tone="blue">{post.category}</Badge>
            <span className="flex items-center gap-1.5 text-xs text-ink-faint">
              <Clock size={13} /> {post.readTime}
            </span>
          </div>
          <h1 className="display mt-4 text-4xl leading-tight md:text-5xl">{post.title}</h1>
          <p className="mt-4 text-lg text-ink-soft">{post.excerpt}</p>
          <div className="mt-2">{post.content}</div>
        </article>

        <div className="glass-dark glass-sheen glow-electric mt-16 rounded-[2rem] p-8 text-center text-white">
          <h2 className="font-display text-xl font-bold tracking-tight">Ready to put this into practice?</h2>
          <p className="mt-2 text-white/60">
            Join ClipForge free, verify an account, and post your first clip today.
          </p>
          <Link
            href="/login"
            className="pill mt-6 inline-block bg-electric px-7 py-3 font-bold text-white shadow-glow-electric hover:bg-electric-soft"
          >
            Start clipping
          </Link>
        </div>
      </main>

      <footer className="border-t border-line/10 py-8 text-center text-sm text-ink-faint">
        ClipForge — a demo rebuild for product research.
      </footer>
    </div>
  );
}
