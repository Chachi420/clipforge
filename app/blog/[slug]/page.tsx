import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import { Badge } from "@/components/ui";
import { BLOG_POSTS, getBlogPost } from "@/lib/blog-posts";

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogPost(params.slug);
  if (!post) {
    return (
      <div className="min-h-screen bg-base-950">
        <main className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h1 className="text-3xl font-black">Post not found</h1>
          <Link
            href="/blog"
            className="mt-6 inline-flex items-center gap-2 text-accent-soft"
          >
            <ArrowLeft size={16} /> Back to blog
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-950">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="text-xl font-black tracking-tight">
          CLIPFORGE
        </Link>
        <Link
          href="/login"
          className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-soft"
        >
          Start clipping
        </Link>
      </nav>

      <main className="mx-auto max-w-3xl px-6 pb-20">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-semibold text-white/50 hover:text-white"
        >
          <ArrowLeft size={16} /> Back to blog
        </Link>

        <article className="mt-8">
          <div className="flex items-center gap-3">
            <Badge tone="blue">{post.category}</Badge>
            <span className="flex items-center gap-1.5 text-xs text-white/40">
              <Clock size={13} /> {post.readTime}
            </span>
          </div>
          <h1 className="mt-4 text-4xl font-black leading-tight">{post.title}</h1>
          <p className="mt-4 text-lg text-white/60">{post.excerpt}</p>
          <div className="mt-2">{post.content}</div>
        </article>

        <div className="mt-16 rounded-2xl border border-white/10 bg-base-850 p-8 text-center">
          <h2 className="text-xl font-bold">Ready to put this into practice?</h2>
          <p className="mt-2 text-white/60">
            Join ClipForge free, verify an account, and post your first clip today.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-2xl bg-accent px-7 py-3 font-bold text-white hover:bg-accent-soft"
          >
            Start clipping
          </Link>
        </div>
      </main>

      <footer className="border-t border-white/10 py-8 text-center text-sm text-white/40">
        ClipForge — a demo rebuild for product research.
      </footer>
    </div>
  );
}
