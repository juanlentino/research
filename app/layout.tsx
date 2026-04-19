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

// Plausible is the only analytics allowed per ARCHITECTURE.md. Gated on
// NEXT_PUBLIC_PLAUSIBLE_DOMAIN so dev builds and forks stay inert; in
// production on Vercel, set both env vars to opt in.
const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
const PLAUSIBLE_SRC =
  process.env.NEXT_PUBLIC_PLAUSIBLE_SRC ||
  "https://plausible.io/js/script.js";

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
        {PLAUSIBLE_DOMAIN ? (
          <Script
            id="plausible"
            strategy="afterInteractive"
            defer
            data-domain={PLAUSIBLE_DOMAIN}
            src={PLAUSIBLE_SRC}
          />
        ) : null}
      </head>
      <body>{children}</body>
    </html>
  );
}
