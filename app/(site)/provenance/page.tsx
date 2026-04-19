import type { Metadata } from "next";
import { Container } from "@/components/container";
import { NoteCard } from "@/components/note-card";
import { getNotesByTopic, TOPICS } from "@/lib/content";
import { SITE } from "@/lib/site";

const TOPIC = TOPICS.provenance;

export const metadata: Metadata = {
  title: TOPIC.title,
  description: TOPIC.description,
  alternates: {
    canonical: `${SITE.url}/${TOPIC.slug}`,
    types: {
      "application/rss+xml": [
        {
          url: `${SITE.url}/${TOPIC.slug}/feed.xml`,
          title: `${SITE.name} — ${TOPIC.title}`,
        },
      ],
    },
  },
};

export default function ProvenanceIndex() {
  const notes = getNotesByTopic(TOPIC.slug);

  return (
    <Container>
      <section className="pt-20 pb-12 border-b border-[var(--rule)]">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--fg-subtle)]">
          Topic
        </p>
        <h1 className="mt-4 font-serif text-4xl leading-tight tracking-tight text-[var(--fg)]">
          {TOPIC.title}
        </h1>
        <p className="mt-4 max-w-[60ch] text-[var(--fg-muted)]">
          {TOPIC.description}
        </p>
      </section>

      <section className="py-12">
        {notes.length === 0 ? (
          <p className="text-[var(--fg-muted)]">
            No notes published in this topic yet.
          </p>
        ) : (
          <ul className="space-y-10">
            {notes.map((n) => (
              <li key={n.frontmatter.slug}>
                <NoteCard note={n} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </Container>
  );
}
