import type { NoteFrontmatter } from "@/lib/types";

export function NoteFooter({ fm }: { fm: NoteFrontmatter }) {
  return (
    <footer className="mt-16 pt-8 border-t border-[var(--rule)] text-sm text-[var(--fg-muted)]">
      <h2 className="text-xs uppercase tracking-[0.18em] text-[var(--fg-subtle)]">
        Cite this note
      </h2>
      <p className="mt-3 font-mono text-[0.82rem] leading-relaxed text-[var(--fg)]">
        Lentino, J. ({new Date(fm.date_published).getFullYear()}).{" "}
        <em>{fm.title}</em>. research.juanlentino.com.
        {fm.doi ? ` https://doi.org/${fm.doi}` : ` ${fm.canonical_url}`}
      </p>

      {fm.changelog?.length ? (
        <div className="mt-8">
          <h2 className="text-xs uppercase tracking-[0.18em] text-[var(--fg-subtle)]">
            Changelog
          </h2>
          <ul className="mt-3 space-y-1 text-[var(--fg-muted)]">
            {fm.changelog.map((c) => (
              <li key={c.date} className="flex gap-4">
                <time
                  dateTime={c.date}
                  className="w-28 shrink-0 tabular-nums text-[var(--fg-subtle)]"
                >
                  {c.date}
                </time>
                <span>{c.change}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </footer>
  );
}
