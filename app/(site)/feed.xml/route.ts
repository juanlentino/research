import { getAllNotes } from "@/lib/content";
import { buildRss } from "@/lib/rss";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const xml = buildRss(getAllNotes(), {
    title: SITE.name,
    description: SITE.description,
    selfUrl: `${SITE.url}/feed.xml`,
    homeUrl: SITE.url,
  });
  return new Response(xml, {
    headers: { "content-type": "application/rss+xml; charset=utf-8" },
  });
}
