import type { ReactNode } from "react";
import type { Metadata } from "next";
import Script from "next/script";
import { buildSiteMetadata } from "@/lib/metadata";
import "./globals.css";

export const metadata: Metadata = buildSiteMetadata();

const themeInitScript = `
try {
  var stored = localStorage.getItem('theme');
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  var theme = stored || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
} catch (_) {}
`.trim();

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="research.juanlentino.com"
          href="/feed.xml"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
