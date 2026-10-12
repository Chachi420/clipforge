import type { Metadata } from "next";

// The blog index is a client component, so metadata lives here in the layout.
export const metadata: Metadata = {
  title: "ClipForge Blog — Clipping Guides & Playbooks",
  description:
    "Honest guides on clipping, editing tools, and earning per view — written from how the product actually works.",
  alternates: { canonical: "/blog" },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
