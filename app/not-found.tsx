import Link from "next/link";
import { Container } from "@/components/container";

export default function NotFound() {
  return (
    <Container>
      <section className="pt-24 pb-16">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--fg-subtle)]">
          404
        </p>
        <h1 className="mt-4 font-serif text-4xl tracking-tight text-[var(--fg)]">
          Not found
        </h1>
        <p className="mt-4 max-w-[60ch] text-[var(--fg-muted)]">
          This URL doesn&rsquo;t point to a published note. Notes are never
          deleted once published — if you followed a citation link and landed
          here, the note may have moved to a versioned URL.
        </p>
        <p className="mt-6">
          <Link href="/">Return to the index.</Link>
        </p>
      </section>
    </Container>
  );
}
