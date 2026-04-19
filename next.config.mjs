/**
 * Keystatic Cloud mounts the admin UI at /keystatic and handles auth via
 * OAuth callbacks, which require a runtime. We run as a standard Next.js
 * SSR app on Vercel; every content page is still pre-rendered at build
 * time via generateStaticParams, so Scholar-indexable HTML is identical
 * to a static export.
 *
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
