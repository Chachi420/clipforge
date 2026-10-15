import type { Metadata } from "next";
import DocsShell from "@/components/DocsShell";
import { getAllDocsSlugs, getDocsArticle } from "@/lib/docs-articles";

export function generateStaticParams() {
  return getAllDocsSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = getDocsArticle(params.slug);
  if (!article) return { title: "Doc not found — ClipForge" };
  return {
    title: `${article.title} — ClipForge Docs`,
    description: `ClipForge documentation: ${article.title}.`,
    alternates: { canonical: `/docs/${article.slug}` },
  };
}

export default function DocsArticlePage({ params }: { params: { slug: string } }) {
  return <DocsShell slug={params.slug} />;
}
