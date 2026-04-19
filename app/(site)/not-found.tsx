import Link from "next/link";
import { Container } from "@/components/container";
import { getTopics } from "@/lib/content";
import { SITE } from "@/lib/site";

export default function NotFound() {
  const topics = getTopics();

  return (
    <Container>
      <section className="pt-24 pb-16">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--fg-subtle)]">
          404 · Not found
        </p>
        <h1 className="mt-4 font-serif text-4xl tracking-tight leading-tight text-[var(--fg)]">
          This URL doesn&rsquo;t point to a published note.
        </h1>
        <p className="mt-6 max-w-[62ch] text-[var(--fg-muted)]">
          Notes are never deleted once published. If you followed a citation
          link and landed here, one of three things happened:
        </p>
        <ol className="mt-4 ml-5 list-decimal space-y-2 text-[var(--fg-muted)] max-w-[62ch]">
          <li>
            The note moved to a versioned URL. Try adding{" "}
            <code className="font-mono text-sm">/v2</code> (or v3, etc.) to the
            URL, or search the topic index below.
          </li>
          <li>
            The note is scheduled to publish later. It exists in the
            git history but isn&rsquo;t yet visible on the site. Check
            back, or see the Source link in the footer.
          </li>
          <li>
            The URL is malformed — note URLs are always slash-free
            (<code className="font-mono text-sm">/topic/slug</code>, not{" "}
            <code className="font-mono text-sm">/topic/slug/</code>).
          </li>
        </ol>

        <div className="mt-10 border-t border-[var(--rule)] pt-8">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--fg-subtle)]">
            Where to go
          </p>
          <ul className="mt-4 space-y-1.5 text-[var(--fg)]">
            <li>
              <Link href="/">Archive index</Link>
            </li>
            {topics.map((t) => (
              <li key={t.slug}>
                <Link href={`/${t.slug}`}>
                  {t.title} — {t.noteCount}{" "}
                  {t.noteCount === 1 ? "note" : "notes"}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/about">About the archive</Link>
            </li>
            <li>
              <a href={SITE.repo}>Source repository</a>
            </li>
          </ul>
        </div>
      </section>
    </Container>
  );
}
