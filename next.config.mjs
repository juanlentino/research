/**
 * Keystatic's admin UI needs dynamic route handlers, which can't coexist with
 * `output: 'export'`. We enable static export only when the CMS is disabled —
 * i.e. every production build on Vercel. Local authoring sessions use
 * `npm run dev` (ENABLE_CMS=true), which skips export and mounts Keystatic.
 *
 * @type {import('next').NextConfig}
 */
const enableCms = process.env.ENABLE_CMS === "true";

const nextConfig = {
  ...(enableCms ? {} : { output: "export" }),
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    mdxRs: false,
  },
};

export default nextConfig;
