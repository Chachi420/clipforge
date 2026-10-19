import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in — Wondeed",
  description: "Sign in to your Wondeed account to manage campaigns, clips, and payouts.",
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
