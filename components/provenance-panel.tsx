import type { ProvenanceEntry } from "@/lib/provenance";
import { SITE } from "@/lib/site";

export function ProvenancePanel({ entry }: { entry: ProvenanceEntry }) {
  const commitShort = entry.git_commit ? entry.git_commit.slice(0, 12) : null;
  const commitUrl = entry.git_commit
    ? `${SITE.repo}/commit/${entry.git_commit}`
    : null;
  const sourceUrl = `${SITE.repo}/blob/${entry.git_commit ?? "main"}/${entry.content_path}`;

  return (
    <section className="mt-12 rounded-md border border-[var(--rule)] bg-[var(--bg-raised)] p-6 text-sm">
      <header className="mb-4 flex items-baseline justify-between gap-4">
        <h2 className="text-xs uppercase tracking-[0.18em] text-[var(--fg-subtle)]">
          Provenance
        </h2>
        <span
          className={`text-[10px] uppercase tracking-[0.18em] ${
            entry.status === "retracted"
              ? "text-[var(--accent)]"
              : "text-[var(--fg-subtle)]"
          }`}
        >
          {entry.status}
        </span>
      </header>

      <dl className="grid grid-cols-1 gap-y-2 sm:grid-cols-[9rem_1fr]">
        <ProvRow label="Content hash">
          <code className="font-mono text-xs break-all">{entry.content_sha256}</code>
        </ProvRow>

        {commitShort && commitUrl ? (
          <ProvRow label="Git commit">
            <a href={commitUrl} className="font-mono text-xs">
              {commitShort}
            </a>
            {entry.git_commit_date ? (
              <span className="ml-3 text-[var(--fg-subtle)]">
                {new Date(entry.git_commit_date).toISOString().slice(0, 10)}
              </span>
            ) : null}
          </ProvRow>
        ) : null}

        <ProvRow label="Source">
          <a href={sourceUrl} className="font-mono text-xs">
            {entry.content_path}
          </a>
        </ProvRow>

        {entry.ots_proof ? (
          <ProvRow label="OpenTimestamps">
            <a
              href={`${SITE.repo}/blob/${entry.git_commit ?? "main"}/${entry.ots_proof}`}
              className="font-mono text-xs"
            >
              {entry.ots_proof}
            </a>
          </ProvRow>
        ) : null}

        {entry.doi ? (
          <ProvRow label="DOI">
            <a href={`https://doi.org/${entry.doi}`}>{entry.doi}</a>
          </ProvRow>
        ) : null}

        <ProvRow label="Canonical">
          <a href={entry.canonical_url}>{entry.canonical_url}</a>
        </ProvRow>
      </dl>

      <footer className="mt-4 pt-4 border-t border-[var(--rule)] text-xs text-[var(--fg-subtle)]">
        Verify independently:{" "}
        <a href={`/verify/${entry.slug}/`}>/verify/{entry.slug}/</a>
      </footer>
    </section>
  );
}

function ProvRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <dt className="text-xs uppercase tracking-[0.14em] text-[var(--fg-subtle)]">
        {label}
      </dt>
      <dd className="text-[var(--fg)]">{children}</dd>
    </>
  );
}
