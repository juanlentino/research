import type { NoteFrontmatter } from "@/lib/types";

export function NoteHeader({ fm }: { fm: NoteFrontmatter }) {
  const updated = fm.date_updated && fm.date_updated !== fm.date_published;
  return (
    <header className="mb-10 pb-8 border-b border-[var(--rule)]">
      <div className="flex flex-wrap items-center gap-3 text-xs tabular-nums text-[var(--fg-subtle)]">
        <span className="uppercase tracking-[0.14em]">{fm.topic}</span>
        <span aria-hidden>·</span>
        <time dateTime={fm.date_published}>
          Published {formatDate(fm.date_published)}
        </time>
        {updated ? (
          <>
            <span aria-hidden>·</span>
            <time dateTime={fm.date_updated}>
              Updated {formatDate(fm.date_updated)}
            </time>
          </>
        ) : null}
        <span aria-hidden>·</span>
        <span>v{fm.version}</span>
        {fm.status === "retracted" ? (
          <span className="ml-2 rounded-sm border border-[var(--accent)] px-1.5 py-0.5 text-[0.65rem] uppercase tracking-[0.18em] text-[var(--accent)]">
            Retracted
          </span>
        ) : null}
      </div>

      <h1 className="mt-4 font-serif text-3xl md:text-4xl leading-[1.15] tracking-tight text-[var(--fg)]">
        {fm.title}
      </h1>

      <div className="mt-4 text-sm text-[var(--fg-muted)]">
        by{" "}
        <a href={`https://orcid.org/${fm.orcid}`} rel="author">
          {fm.author}
        </a>
      </div>

      <p className="mt-6 max-w-[60ch] text-[var(--fg-muted)]">{fm.abstract}</p>

      <dl className="mt-6 grid grid-cols-1 gap-y-2 text-xs text-[var(--fg-subtle)] sm:grid-cols-[7rem_1fr]">
        {fm.doi ? (
          <>
            <dt className="uppercase tracking-[0.14em]">DOI</dt>
            <dd>
              <a href={`https://doi.org/${fm.doi}`}>{fm.doi}</a>
            </dd>
          </>
        ) : null}
        <dt className="uppercase tracking-[0.14em]">License</dt>
        <dd>{fm.license}</dd>
        <dt className="uppercase tracking-[0.14em]">Canonical</dt>
        <dd>
          <a href={fm.canonical_url}>{fm.canonical_url}</a>
        </dd>
        {fm.keywords.length ? (
          <>
            <dt className="uppercase tracking-[0.14em]">Keywords</dt>
            <dd>{fm.keywords.join(", ")}</dd>
          </>
        ) : null}
      </dl>
    </header>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
