import { getNotesByTopic, TOPICS } from "@/lib/content";
import { buildRss } from "@/lib/rss";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const topic = TOPICS.provenance;
  const xml = buildRss(getNotesByTopic(topic.slug), {
    title: `${SITE.name} — ${topic.title}`,
    description: topic.description,
    selfUrl: `${SITE.url}/${topic.slug}/feed.xml`,
    homeUrl: `${SITE.url}/${topic.slug}/`,
  });
  return new Response(xml, {
    headers: { "content-type": "application/rss+xml; charset=utf-8" },
  });
}
