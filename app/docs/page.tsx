import type { Metadata } from "next";
import DocsShell from "@/components/DocsShell";

export const metadata: Metadata = {
  title: "Wondeed Docs — How Clipping Campaigns Work",
  description:
    "Guides for brands and clippers: launching campaigns, submitting clips, view verification, and getting paid.",
  alternates: { canonical: "/docs" },
};

export default function DocsHub() {
  return <DocsShell slug="welcome" />;
}
