import Link from "next/link";
import { getAllNotes, getTopics } from "@/lib/content";
import { NoteCard } from "@/components/note-card";
import { Container } from "@/components/container";

export default function HomePage() {
  const topics = getTopics();
  const recent = getAllNotes().slice(0, 6);

  return (
    <Container>
      <section className="pt-20 pb-16 border-b border-[var(--rule)]">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--fg-subtle)]">
          research.juanlentino.com
        </p>
        <h1 className="mt-4 font-serif text-4xl md:text-5xl leading-[1.1] tracking-tight text-[var(--fg)]">
          Notes on music rights, cryptographic provenance, and metadata
          systems.
        </h1>
        <p className="mt-6 max-w-[58ch] text-[var(--fg-muted)] text-lg">
          A living archive of technical notes and defensive publications
          by Juan Lentino. Each note is timestamped in git, deposited on
          Zenodo for DOI minting, and released under CC BY 4.0.
        </p>
      </section>

      <section className="py-16 border-b border-[var(--rule)]">
        <h2 className="text-xs uppercase tracking-[0.18em] text-[var(--fg-subtle)]">
          Topics
        </h2>
        <ul className="mt-6 divide-y divide-[var(--rule)]">
          {topics.map((t) => (
            <li key={t.slug} className="py-5">
              <Link
                href={`/${t.slug}`}
                className="flex items-baseline justify-between gap-6 no-underline hover:no-underline"
              >
                <div>
                  <div className="font-serif text-2xl text-[var(--fg)] group-hover:underline">
                    {t.title}
                  </div>
                  <div className="mt-1 text-sm text-[var(--fg-muted)] max-w-[60ch]">
                    {t.description}
                  </div>
                </div>
                <div className="text-xs tabular-nums text-[var(--fg-subtle)]">
                  {t.noteCount} {t.noteCount === 1 ? "note" : "notes"}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="py-16">
        <h2 className="text-xs uppercase tracking-[0.18em] text-[var(--fg-subtle)]">
          Recent
        </h2>
        {recent.length === 0 ? (
          <p className="mt-6 text-[var(--fg-muted)]">
            No notes published yet.
          </p>
        ) : (
          <ul className="mt-6 space-y-6">
            {recent.map((n) => (
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
