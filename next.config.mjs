/**
 * Keystatic Cloud mounts the admin UI at /keystatic and handles auth via
 * OAuth callbacks, which require a runtime. We run as a standard Next.js
 * SSR app on Vercel; every content page is still pre-rendered at build
 * time via generateStaticParams, so Scholar-indexable HTML is identical
 * to a static export.
 *
 * Note on trailing slashes: we intentionally do NOT set `trailingSlash: true`.
 * Keystatic's client + API routes break under blanket slash normalization
 * (OAuth redirects to `/api/keystatic/.../` fail). The trailing-slash-free
 * convention also aligns with arXiv, Zenodo, and most academic citation URLs.
 *
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
