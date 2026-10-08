import DocsShell from "@/components/DocsShell";
import { getAllDocsSlugs } from "@/lib/docs-articles";

export function generateStaticParams() {
  return getAllDocsSlugs().map((slug) => ({ slug }));
}

export default function DocsArticlePage({ params }: { params: { slug: string } }) {
  return <DocsShell slug={params.slug} />;
}
