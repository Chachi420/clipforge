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
  title: "ClipForge — Clip. Post. Get Paid.",
  description: "The clipping network: brands run pay-per-view campaigns, clippers earn per verified view.",
};

/**
 * Sets the theme class before first paint to avoid FOUC.
 * Order: saved preference → OS preference → light default.
 */
const themeInit = `(function(){try{var t=localStorage.getItem('cf-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={display.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
