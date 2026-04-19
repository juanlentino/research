# Architecture

Technical reference for research.juanlentino.com — the repository that serves the site. This is the public documentation; the AI-tooling configuration lives elsewhere.

## What this repo is

- A Next.js 15 App Router site hosting MDX-based technical notes
- A defensive publication archive, with git history as timestamped prior-art record and four independent external attestation layers (OpenTimestamps, SLSA, Zenodo DOI, GitHub signing)
- A citation target for academic and industry researchers (Google Scholar indexed, CC BY 4.0 licensed)

## What this repo is not

- A blog. Tone is technical and scholarly, not conversational.
- A product landing page. Does not advertise ReverBeat, Panacea, or any commercial offering directly.
- A user-facing dynamic application. The only runtime component is the authenticated Keystatic Cloud admin at `/keystatic`. All reader-facing routes are pre-rendered at build time.

## Build + deploy

Next.js 15 App Router, deployed as SSR on Vercel. Every content route (`/`, `/about`, `/provenance`, `/provenance/[slug]`, `/verify/[slug]`, `/feed.xml`, `/provenance/feed.xml`, `/robots.txt`, `/sitemap.xml`) is pre-rendered at build time via `generateStaticParams`. Scholar crawlers and readers receive identical HTML whether the deploy target is `output: 'export'` or SSR. Only `/keystatic/*` and `/api/keystatic/*` run at request time, and those are gated behind Keystatic Cloud OAuth.

**Why SSR and not static export:** Keystatic Cloud's OAuth callback requires a runtime route handler. `output: 'export'` cannot coexist with it.

**CMS:** [Keystatic Cloud](https://keystatic.cloud). Browser-authored notes commit to this repo via the GitHub API. Entry point: https://research.juanlentino.com/keystatic.

**DNS:** Cloudflare (DNS only, not proxied) → Vercel. Vercel serves the http→https 308 redirect and TLS termination.

## URL structure

Canonical URLs are **slash-free**. Trailing-slash variants issue 301 redirects to the canonical form via `vercel.json`.

```
research.juanlentino.com                           landing page
research.juanlentino.com/about                     bio, affiliations, ORCID
research.juanlentino.com/provenance                provenance topic index
research.juanlentino.com/provenance/<slug>         individual provenance note
research.juanlentino.com/verify/<slug>             reader-facing verification
research.juanlentino.com/<future-topic>            new topic when added
research.juanlentino.com/feed.xml                  global RSS
research.juanlentino.com/provenance/feed.xml       topic-specific RSS
research.juanlentino.com/sitemap.xml               SEO sitemap
research.juanlentino.com/robots.txt                crawler policy
research.juanlentino.com/keystatic                 auth-gated CMS admin
```

Every URL is a potential citation target. Changes to the URL scheme require 301 redirects from the old form in `vercel.json`.

## Content layout

```
content/
├── provenance/
│   ├── <slug>.mdx
│   ├── <slug>.mdx.ots     OpenTimestamps proof (auto-generated, committed)
│   └── _drafts/           unpublished notes (tracked in git, excluded from build)
└── <future-topic>/
    └── ...
```

## MDX frontmatter

Every note must include this frontmatter. Missing fields break Scholar indexing and fail CI (`scripts/validate-scholar.mjs`).

```yaml
---
title: "Full title of the note"
slug: "url-slug-matching-filename"
topic: "provenance"
date_published: "YYYY-MM-DD"
date_updated: "YYYY-MM-DD"
author: "Juan Lentino"
orcid: "0009-0006-8151-5920"
license: "CC-BY-4.0"
doi: "10.5281/zenodo.XXXXXXX"    # optional until Zenodo mints
pdf_url: "https://..."            # optional — defaults to local /pdf/<topic>/<slug>.pdf
ssrn_url: "https://..."           # optional — SSRN mirror
canonical_url: "https://research.juanlentino.com/<topic>/<slug>"
abstract: "200-word abstract here."
keywords:
  - provenance
  - cryptographic-authentication
  - music-rights
version: 1
status: published                 # draft | published | retracted
scheduled_for: "YYYY-MM-DD"       # optional — hide until this date
changelog:
  - date: "YYYY-MM-DD"
    change: "Initial publication"
---
```

## Tech stack

- Next.js 15.5.x (App Router, SSR on Vercel, per-route SSG via `generateStaticParams`)
- MDX via `next-mdx-remote/rsc` with `remark-gfm`, `remark-smartypants`, `rehype-slug`, `rehype-autolink-headings`
- Tailwind CSS v4 (CSS-first `@theme`)
- TypeScript strict mode
- Keystatic Cloud (git-based CMS, browser authoring)
- Deployed to Vercel
- DNS via Cloudflare

## Design principles

1. **Scholarly over promotional.** Quiet typography, generous whitespace, minimal color palette.
2. **Reading-first.** Line length capped at ~70 characters. Large body text. High contrast.
3. **Apple-inspired typography.** 11px minimum floor, `font-display` class, consistent type scale.
4. **Dark mode via `data-theme="dark"`.**
5. **No analytics bloat.** Plausible is the maximum; no GA, no pixels, no cookie banners.
6. **No gated content.** Everything is public, everything is CC BY 4.0.

## Provenance stack

The defensive-publication claim rests on four externally verifiable layers:

1. **Signed git commits.** GitHub signs every commit made through the web UI or the Keystatic Cloud API. Dependabot and the OTS bot commit via GitHub's API and therefore sign automatically. CI enforces signed-commit verification on every pull request (`.github/workflows/ci.yml → verify-signatures`).
2. **OpenTimestamps proofs.** Every MDX note is stamped to Bitcoin via the OTS calendar network, producing a `<file>.mdx.ots` sibling file. `.github/workflows/opentimestamps.yml` runs on every push to main that touches `content/**/*.mdx`. Proofs verify offline with the `ots` CLI; reader-facing instructions are at `/verify/<slug>`.
3. **SLSA build attestation.** Every push to main produces a Sigstore-signed attestation of `provenance.json` via `actions/attest-build-provenance`. The manifest enumerates every note's sha256, git commit, OTS proof path, and DOI at that commit. Verifiers run `gh attestation verify provenance.json --repo juanlentino/research`.
4. **Zenodo DOIs.** Repo-level DOIs mint automatically on each GitHub release via Zenodo's native GitHub integration. Per-note DOIs mint on demand via the `zenodo-deposit` workflow.

## OpenTimestamps workflow

**Automated (default).** The workflow at `.github/workflows/opentimestamps.yml` runs on every push to `main` that touches `content/**/*.mdx`. It installs the `opentimestamps-client` Python package, runs `ots stamp <file>` on each changed MDX, and pushes the resulting `.ots` files back to `main` as a commit authored by `ots-bot`. Typical lag: under two minutes.

**Manual (when needed):**
```
pip install opentimestamps-client
ots stamp content/<topic>/<slug>.mdx
git add content/<topic>/<slug>.mdx.ots
git commit -m "ots(<topic>/<slug>): stamp source"
```

**Verification (reader-facing).** The `/verify/<slug>` page renders copy-paste commands. Any reader with `ots verify` can confirm the Bitcoin-anchored timestamp.

**Policy.** Never delete a `.ots` file. A broken or missing proof must be regenerated from the current MDX; if the source content has changed materially since the original proof, publish a new version (`/provenance/<slug>/v2`) rather than overwriting the timestamp record.

## Content hashing

Every published note has a SHA-256 of its MDX source recorded in the per-commit provenance manifest (`provenance.json`) generated by `scripts/provenance.mjs`. The manifest is:

- Rebuilt on every `npm run build` (via `prebuild`)
- Enumerated per note: `{ slug, topic, canonical_url, content_sha256, content_bytes, git_commit, git_commit_date, ots_proof, doi, ... }`
- Surfaced to readers in the per-note provenance panel and `/verify/<slug>`
- SLSA-attested on every push to `main`

The hash pins the exact bytes of the MDX source at a specific commit. Third parties can reproduce it with `shasum -a 256 content/<topic>/<slug>.mdx` after checking out the recorded `git_commit`. If the hash in the manifest doesn't match the hash computed from the file at that commit, the archive has been tampered with.

`provenance.json` itself is gitignored; it's an ephemeral build artifact. The authoritative record is the signed attestation + the git history.

## PDF snapshot workflow

Every published note has a rendered PDF snapshot at `public/pdf/<topic>/<slug>.pdf`, committed to the repo.

**How it runs.** `.github/workflows/generate-pdfs.yml` listens for `deployment_status` events. When Vercel reports a Production deploy as `success`, the workflow renders every published note via Puppeteer and commits the PDFs back as a commit authored by `pdf-bot`.

**Lag.** PDFs for a new note appear on the *next* build after its initial deploy. `citation_pdf_url` emits conditionally — if the local PDF exists, Scholar picks up the URL; otherwise the tag is omitted.

**Override.** Set `pdf_url` in frontmatter to point `citation_pdf_url` at an external location (e.g. a Zenodo-hosted PDF). The local PDF is still rendered and committed; Scholar sees the override.

**Manual generation.** `npm run generate:pdfs --base=http://localhost:3000` renders against a local dev server.

## Scheduled publishing

Notes may be written and committed well before their public release. Set `scheduled_for: YYYY-MM-DD` in frontmatter to hide a note from every reader surface (sitemap, both RSS feeds, the topic index, direct URL access) until that date. When the date arrives, the next build re-emits the note as visible.

**Visibility gate.** `lib/content.ts` captures the build-time date once (UTC) and applies `isHiddenBySchedule(fm)` in both `getNotesByTopic` and `getNote`. A scheduled note is effectively invisible — including from `generateStaticParams`.

**Daily trigger.** `.github/workflows/scheduled-publish.yml` runs at `0 12 * * *` UTC (07:00 ET EDT / 08:00 ET EST) and POSTs to a Vercel deploy hook. Vercel rebuilds production; the new build reads the current date, and any note whose `scheduled_for` has passed becomes visible.

**Provenance implication.** OTS proofs are generated when the MDX is *committed*, not when it *publishes*. A note committed months before `scheduled_for` has a Bitcoin-anchored timestamp showing the earlier date — the strongest form of prior-art evidence.

**Relationship to `date_published`.** `date_published` is the canonical publication date surfaced in Scholar metadata and the reader-visible byline. `scheduled_for` is a visibility gate. They should match for normal scheduled publishes; the validator rejects `scheduled_for < date_published`.

## SEO and academic metadata

Every note page renders the following `<meta>` tags via `lib/metadata.ts:buildNoteMetadata`:

**Google Scholar:**
- `citation_title`, `citation_author`, `citation_publication_date`
- `citation_journal_title` (= "research.juanlentino.com")
- `citation_doi` (when DOI is set in frontmatter)
- `citation_pdf_url` (when PDF exists)
- `citation_repository_url` (when `ssrn_url` is set)
- `citation_abstract_html_url`, `citation_language`, `citation_keywords`

**Dublin Core:**
- `DC.title`, `DC.creator`, `DC.date`, `DC.rights`, `DC.identifier`
- `DC.language`, `DC.type`, `DC.subject`
- `DC.identifier.doi` when present
- `DC.relation` (= `ssrn_url`) when present

Open Graph, Twitter Card, canonical `<link>`, and RSS discovery are emitted from the same function.

## Versioning policy

- **Typos, clarifications, reference additions:** silent in-place updates. Bump `date_updated` and append a `changelog` entry.
- **Substantive changes (rewrites, thesis shifts, retractions):** create a new version at `/provenance/<slug>/v2`. The previous URL 301-redirects to the versioned URL. The new version is canonical.
- **Never delete a note.** If retracted, set `status: retracted` in frontmatter; the URL stays live with a retraction notice.

## Git discipline

- **Signed commits, enforced on PRs.** CI refuses PRs containing unverified commits, using the GitHub API's verification status (not local GPG). GitHub web, Keystatic Cloud, Dependabot, and bot commits all sign automatically. CLI commits from an unconfigured machine are not signed; direct push to main without signing should be blocked by branch protection once enabled.
- **Meaningful commit messages.** Each commit to a note's MDX is a timestamped prior-art record. Treat commit messages as scholarly provenance.
- **Squash only for infrastructure changes.** Content commits are preserved unsquashed to maintain timestamp granularity.

## Parallel publication to Zenodo

Every note is deposited to Zenodo for DOI minting. The Zenodo record is the citable academic reference; research.juanlentino.com is the canonical reading surface.

Workflow per note:
1. Publish to research.juanlentino.com
2. Generate PDF snapshot (automatic via CI)
3. Dispatch `.github/workflows/zenodo-deposit.yml` with topic + slug
4. Zenodo mints DOI; workflow PRs the DOI back into the MDX
5. Merge; site rebuilds with DOI rendered in `<head>` and provenance panel

Repo-level DOIs on GitHub releases are handled automatically by Zenodo's GitHub integration.

## New-note checklist

1. **Frontmatter.** All required fields populated: `title`, `slug` (matches filename), `topic`, `date_published`, `date_updated`, `author`, `orcid`, `license`, `canonical_url` (slash-free, matches `/{topic}/{slug}`), `abstract` (40+ chars), `keywords` (2+), `version`, `status: published`, `changelog` with initial entry. Optional: `doi`, `pdf_url`, `ssrn_url`, `scheduled_for`.
2. **Filename = slug.** `content/<topic>/<slug>.mdx`. Slug is lowercase-alphanumeric-hyphen, no underscores.
3. **Schedule (optional).** Set `scheduled_for: YYYY-MM-DD` to hide until that date. Commit now — OTS stamps today (stronger prior-art claim). Daily cron triggers rebuild; note appears on the scheduled date.
4. **Local build passes.** `npm run build` succeeds — `validate:scholar` + `validate:feed` + `provenance` all green.
5. **Commit + push.** Commit message is a prior-art record: describe the publication event, not the file. Example: `publish(provenance): "On identifier mapping" (v1)`.
6. **Automatic follow-ups (no action needed):**
   - OTS bot stamps `.mdx.ots` → commits back (~1 min)
   - Vercel deploys → CI attests `provenance.json` (~3 min)
   - PDF bot renders `public/pdf/<topic>/<slug>.pdf` → commits back (~2 min after deploy)
   - Scheduled-publish cron flips visibility at 12:00 UTC on the release date
7. **DOI mint (manual, one-click).** GitHub → Actions → `zenodo-deposit` → "Run workflow" → enter topic + slug → choose `sandbox: false` for a real DOI. Merge the resulting DOI PR.
