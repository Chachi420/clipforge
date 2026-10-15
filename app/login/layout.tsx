import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in — ClipForge",
  description: "Sign in to your ClipForge account to manage campaigns, clips, and payouts.",
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
