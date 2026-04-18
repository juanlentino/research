import Link from "next/link";
import type { Note } from "@/lib/types";

export function NoteCard({ note }: { note: Note }) {
  const { frontmatter } = note;
  const href = `/${frontmatter.topic}/${frontmatter.slug}/`;
  return (
    <Link href={href} className="group block no-underline">
      <div className="flex items-baseline gap-4 text-xs tabular-nums text-[var(--fg-subtle)]">
        <time dateTime={frontmatter.date_published}>
          {formatDate(frontmatter.date_published)}
        </time>
        <span className="uppercase tracking-[0.14em]">
          {frontmatter.topic}
        </span>
      </div>
      <h3 className="mt-1.5 font-serif text-xl leading-snug text-[var(--fg)] group-hover:underline">
        {frontmatter.title}
      </h3>
      <p className="mt-2 text-[var(--fg-muted)] max-w-[62ch]">
        {frontmatter.abstract}
      </p>
    </Link>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
