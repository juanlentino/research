import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/container";
import { getNotesByTopic, getNote } from "@/lib/content";
import { getProvenance, loadManifest } from "@/lib/provenance";
import { SITE } from "@/lib/site";

const TOPIC = "provenance";

export function generateStaticParams() {
  return getNotesByTopic(TOPIC).map((n) => ({ slug: n.frontmatter.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const note = getNote(TOPIC, slug);
  if (!note) return {};
  return {
    title: `Verify — ${note.frontmatter.title}`,
    description: `Independent verification instructions for "${note.frontmatter.title}".`,
    alternates: { canonical: `${SITE.url}/verify/${slug}` },
    robots: { index: false, follow: true },
  };
}

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const note = getNote(TOPIC, slug);
  if (!note) notFound();

  const entry = getProvenance(TOPIC, slug);
  const manifest = loadManifest();

  return (
    <Container>
      <section className="pt-20 pb-16">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--fg-subtle)]">
          Verify
        </p>
        <h1 className="mt-4 font-serif text-3xl md:text-4xl tracking-tight leading-tight text-[var(--fg)]">
          {note.frontmatter.title}
        </h1>
        <p className="mt-4 max-w-[60ch] text-[var(--fg-muted)]">
          This page lets you independently confirm the integrity and
          timestamp of this note without trusting research.juanlentino.com,
          GitHub, or Vercel. Every claim below can be reproduced from a
          clean machine with only <code>git</code>,{" "}
          <code>sha256sum</code>, and{" "}
          <a href="https://github.com/opentimestamps/opentimestamps-client">
            <code>ots</code>
          </a>.
        </p>

        {!entry ? (
          <p className="mt-8 rounded-md border border-[var(--rule)] p-4 text-sm text-[var(--fg-muted)]">
            Provenance manifest not yet generated. Run{" "}
            <code>npm run provenance</code> locally, or wait for the next
            CI build.
          </p>
        ) : (
          <div className="mt-12 space-y-10 text-sm">
            <Step number={1} title="Clone the repository">
              <pre>
{`git clone ${SITE.repo}.git
cd research`}
              </pre>
            </Step>

            <Step number={2} title="Verify the content hash">
              <p className="mb-3 text-[var(--fg-muted)]">
                The SHA-256 of the MDX source as of commit{" "}
                {entry.git_commit ? (
                  <a href={`${SITE.repo}/commit/${entry.git_commit}`}>
                    <code>{entry.git_commit.slice(0, 12)}</code>
                  </a>
                ) : (
                  "HEAD"
                )}{" "}
                should equal{" "}
                <code className="break-all">{entry.content_sha256}</code>.
              </p>
              <pre>
{`git checkout ${entry.git_commit ?? "main"}
shasum -a 256 ${entry.content_path}`}
              </pre>
            </Step>

            <Step number={3} title="Verify the OpenTimestamps proof">
              {entry.ots_proof ? (
                <>
                  <p className="mb-3 text-[var(--fg-muted)]">
                    The proof anchors the MDX file&apos;s hash to the Bitcoin
                    blockchain via the OpenTimestamps calendar servers.
                    Verification is independent of GitHub.
                  </p>
                  <pre>
{`ots verify ${entry.ots_proof}`}
                  </pre>
                </>
              ) : (
                <p className="text-[var(--fg-muted)]">
                  No OpenTimestamps proof committed yet. The next publish
                  workflow will generate{" "}
                  <code>{entry.content_path}.ots</code>.
                </p>
              )}
            </Step>

            <Step number={4} title="Verify the build provenance (SLSA)">
              <p className="mb-3 text-[var(--fg-muted)]">
                Every deployed build carries a Sigstore-signed attestation
                linking the served HTML to this exact commit.
              </p>
              <pre>
{`gh attestation verify out/provenance/${entry.slug}/index.html \\
  --repo juanlentino/research`}
              </pre>
            </Step>

            {entry.doi ? (
              <Step number={5} title="Cross-reference the Zenodo deposit">
                <p className="mb-3 text-[var(--fg-muted)]">
                  A parallel copy of this note is deposited on Zenodo with
                  DOI{" "}
                  <a href={`https://doi.org/${entry.doi}`}>{entry.doi}</a>.
                  Zenodo records are immutable once published.
                </p>
                <pre>
{`curl -s https://doi.org/${entry.doi}`}
                </pre>
              </Step>
            ) : null}
          </div>
        )}

        <footer className="mt-16 pt-8 border-t border-[var(--rule)] text-xs text-[var(--fg-subtle)]">
          {manifest?.generated_at ? (
            <>
              Manifest generated{" "}
              <time dateTime={manifest.generated_at}>
                {manifest.generated_at}
              </time>
              .{" "}
            </>
          ) : null}
          <Link href={`/${TOPIC}/${slug}`}>Back to the note.</Link>
        </footer>
      </section>
    </Container>
  );
}

function Step({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="font-serif text-xl text-[var(--fg)]">
        <span className="mr-3 text-[var(--fg-subtle)] tabular-nums">
          {number.toString().padStart(2, "0")}
        </span>
        {title}
      </h2>
      <div className="mt-3 [&_pre]:bg-[var(--bg-raised)] [&_pre]:border [&_pre]:border-[var(--rule)] [&_pre]:rounded-md [&_pre]:p-4 [&_pre]:text-xs [&_pre]:font-mono [&_pre]:overflow-x-auto [&_code]:font-mono [&_code]:text-xs">
        {children}
      </div>
    </div>
  );
}
