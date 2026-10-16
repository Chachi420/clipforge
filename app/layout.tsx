import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://clipforge-pied-rho.vercel.app"),
  title: "ClipForge — The Pay-Per-View Clipping Marketplace",
  description:
    "Brands run pay-per-view clipping campaigns; clippers post clips and earn per verified view. Real rates up front, hard budget caps, 1,000+ followers to verify.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "ClipForge — The Pay-Per-View Clipping Marketplace",
    description:
      "Brands run pay-per-view clipping campaigns; clippers post clips and earn per verified view.",
    url: "/",
    siteName: "ClipForge",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "ClipForge — Clip. Post. Get Paid.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ClipForge — The Pay-Per-View Clipping Marketplace",
    description:
      "Brands run pay-per-view clipping campaigns; clippers post clips and earn per verified view.",
    images: ["/opengraph-image"],
  },
};

/**
 * Sets the theme class before first paint to avoid FOUC.
 * Order: saved preference → OS preference → light default.
 */
const themeInit = `(function(){try{var t=localStorage.getItem('cf-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();`;

/** Marks JS availability so .reveal content never hides when JS fails. */
const jsInit = `(function(){document.documentElement.classList.add('js')})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={display.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <script dangerouslySetInnerHTML={{ __html: jsInit }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
