import { ImageResponse } from "next/og";
import { getNote, getNotesByTopic } from "@/lib/content";
import { SITE } from "@/lib/site";

const TOPIC = "provenance";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `Note from ${SITE.name}`;

export function generateStaticParams() {
  return getNotesByTopic(TOPIC).map((n) => ({ slug: n.frontmatter.slug }));
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function NoteOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const note = getNote(TOPIC, slug);

  const title = note?.frontmatter.title ?? "Not found";
  const datePublished = note?.frontmatter.date_published
    ? formatDate(note.frontmatter.date_published)
    : "";
  const author = note?.frontmatter.author ?? SITE.author.name;
  const topicLabel = note?.frontmatter.topic ?? TOPIC;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#fafaf9",
          color: "#171717",
          fontFamily: "serif",
          padding: "72px 88px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 20,
            fontFamily: "sans-serif",
            color: "#6b6b6b",
            textTransform: "uppercase",
            letterSpacing: "0.22em",
            fontWeight: 500,
          }}
        >
          <div>{topicLabel}</div>
          <div>research.juanlentino.com</div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div
            style={{
              fontSize: title.length > 60 ? 54 : 64,
              lineHeight: 1.12,
              letterSpacing: "-0.015em",
              fontWeight: 500,
              color: "#171717",
              maxWidth: "92%",
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            fontSize: 22,
            fontFamily: "sans-serif",
            color: "#4a4a4a",
            borderTop: "1px solid #e7e5e4",
            paddingTop: 24,
          }}
        >
          <div>{author}</div>
          <div style={{ fontSize: 20, letterSpacing: "0.08em", color: "#6b6b6b" }}>
            {datePublished}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
