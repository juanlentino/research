import type { Note } from "./types";
import { SITE } from "./site";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export interface FeedOptions {
  title: string;
  description: string;
  selfUrl: string;
  homeUrl: string;
}

export function buildRss(notes: Note[], opts: FeedOptions): string {
  const items = notes
    .map((n) => {
      const { frontmatter: fm } = n;
      const pub = new Date(fm.date_published).toUTCString();
      return `    <item>
      <title>${escapeXml(fm.title)}</title>
      <link>${escapeXml(fm.canonical_url)}</link>
      <guid isPermaLink="true">${escapeXml(fm.canonical_url)}</guid>
      <pubDate>${pub}</pubDate>
      <author>${escapeXml(SITE.author.email)} (${escapeXml(fm.author)})</author>
      <description>${escapeXml(fm.abstract)}</description>
      ${fm.keywords.map((k) => `<category>${escapeXml(k)}</category>`).join("\n      ")}
      ${fm.doi ? `<dc:identifier>${escapeXml(`doi:${fm.doi}`)}</dc:identifier>` : ""}
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(opts.title)}</title>
    <link>${escapeXml(opts.homeUrl)}</link>
    <description>${escapeXml(opts.description)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(opts.selfUrl)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
}
