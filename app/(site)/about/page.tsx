import type { Metadata } from "next";
import { Container } from "@/components/container";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `About ${SITE.author.name} — ${SITE.description}`,
  alternates: { canonical: `${SITE.url}/about` },
};

export default function AboutPage() {
  return (
    <Container>
      <section className="pt-20 pb-16">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--fg-subtle)]">
          About
        </p>
        <h1 className="mt-4 font-serif text-4xl leading-tight tracking-tight text-[var(--fg)]">
          Juan Lentino
        </h1>

        <div className="prose-body mt-10">
          <p>
            Juan Lentino is a voting member of The Recording Academy and The
            Latin Recording Academy, founder of Panacea Studio, and an MBA
            candidate at Westcliff University focused on Applied AI in
            Business. His work centers on music rights infrastructure,
            cryptographic provenance for audio, and metadata systems designed
            for the AI era.
          </p>

          <p>
            This site is a living archive of technical notes and defensive
            publications. Each note is git-timestamped, mirrored to Zenodo for
            DOI minting, and released under CC BY 4.0. The repository history
            serves as a prior-art record.
          </p>

          <h2>Affiliations</h2>
          <ul>
            <li>Voting Member, The Recording Academy</li>
            <li>Voting Member, The Latin Recording Academy</li>
            <li>Founder, Panacea Studio</li>
            <li>MBA Candidate (Applied AI in Business), Westcliff University</li>
          </ul>

          <h2>Identifiers</h2>
          <ul>
            <li>
              ORCID:{" "}
              <a href={`https://orcid.org/${SITE.author.orcid}`}>
                {SITE.author.orcid}
              </a>
            </li>
            <li>
              Email: <a href={`mailto:${SITE.author.email}`}>{SITE.author.email}</a>
            </li>
            <li>
              Source: <a href={SITE.repo}>{SITE.repo}</a>
            </li>
          </ul>

          <h2>Correspondence</h2>
          <p>
            For citation questions, standards-body collaboration, or research
            correspondence, email{" "}
            <a href={`mailto:${SITE.author.email}`}>{SITE.author.email}</a>.
          </p>
        </div>
      </section>
    </Container>
  );
}
