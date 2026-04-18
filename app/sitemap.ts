import type { MetadataRoute } from "next";
import { getAllNotes, getTopicSlugs } from "@/lib/content";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/about/`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
  ];

  const topicUrls: MetadataRoute.Sitemap = getTopicSlugs().map((t) => ({
    url: `${SITE.url}/${t}/`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const noteUrls: MetadataRoute.Sitemap = getAllNotes().map((n) => ({
    url: n.frontmatter.canonical_url,
    lastModified: new Date(n.frontmatter.date_updated || n.frontmatter.date_published).toISOString(),
    changeFrequency: "yearly",
    priority: 0.7,
  }));

  return [...staticUrls, ...topicUrls, ...noteUrls];
}
