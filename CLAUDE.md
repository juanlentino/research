# CLAUDE.md

Project context for Claude Code. Read before making changes.

## Purpose

This repository hosts **research.juanlentino.com**, a living body of technical notes, defensive publications, and long-form writing on music rights infrastructure, cryptographic provenance, and AI-era metadata systems.

Author: Juan Lentino. Voting member, The Recording Academy and The Latin Recording Academy. Founder, Panacea Studio. MBA candidate (Applied AI in Business), Westcliff University.

## What this repo is

- A Next.js 15 App Router site hosting MDX-based technical notes
- A defensive publication archive, with git history as timestamped prior-art record and four independent external attestation layers (OpenTimestamps, SLSA, Zenodo DOI, GitHub signing)
- A citation target for academic and industry researchers (Google Scholar indexed, CC BY 4.0 licensed)

## What this repo is not

- A blog. Tone is technical and scholarly, not conversational.
- A product landing page. Does not advertise ReverBeat, Panacea, or any commercial offering directly.
- A user-facing dynamic application. The only runtime component is the authenticated Keystatic Cloud admin at `/keystatic`. All reader-facing routes are pre-rendered at build time.

## Architecture

**Build + deploy:** Next.js 15 App Router, deployed as SSR on Vercel (Syntharchy team). Every content route (`/`, `/about`, `/provenance`, `/provenance/[slug]`, `/verify/[slug]`, `/feed.xml`, `/provenance/feed.xml`, `/robots.txt`, `/sitemap.xml`) is pre-rendered at build time via `generateStaticParams`. Scholar crawlers and readers receive identical HTML whether we deploy as `output: 'export'` or SSR. Only `/keystatic/*` and `/api/keystatic/*` run at request time, and those are gated behind Keystatic Cloud OAuth.

**Why SSR and not static export:** Keystatic Cloud's OAuth callback requires a runtime route handler. `output: 'export'` cannot coexist with it. Do not re-add `output: 'export'` to `next.config.mjs` — it will break browser authoring.

**CMS:** Keystatic Cloud, project `research/research`. Browser-authored notes commit to this repo via the GitHub API. Entry point: https://research.juanlentino.com/keystatic. Local authoring via `npm run dev` is supported — the "Allow local development" setting on Keystatic Cloud permits 127.0.0.1 auth.

**DNS:** Cloudflare (DNS only, not proxied) → Vercel. **Vercel** serves the http→https 308 redirect and TLS termination — confirmed by the `server: Vercel` response header. If Cloudflare proxying is enabled later, the redirect source will shift and the documented "where the rule lives" note here must be updated.

## URL structure

Canonical URLs are **slash-free**. Trailing-slash variants issue 301 redirects to the canonical form; the redirect rules live in `vercel.json` under `redirects`. Do **not** re-enable `trailingSlash: true` in `next.config.mjs` — it breaks Keystatic's OAuth callback.

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

**Critical: do not restructure URLs without explicit instruction.** Every URL is a potential citation target. Changes break inbound links, Google Scholar indexing, and defensive-publication timestamps. Any URL change must include a 301 redirect from the old form in `vercel.json`.

## Content layout

```
content/
├── provenance/
│   ├── <slug>.mdx
│   ├── <slug>.mdx.ots     OpenTimestamps proof (auto-generated, committed)
│   └── _drafts/           gitignored; local-only drafts
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
pdf_url: "https://..."            # optional until PDF exists
canonical_url: "https://research.juanlentino.com/<topic>/<slug>"
abstract: "200-word abstract here."
keywords:
  - provenance
  - cryptographic-authentication
  - music-rights
version: 1
status: published                 # published | retracted
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
- Deployed to Vercel (Syntharchy team)
- DNS via Cloudflare

## Design principles

Borrow aesthetic cues from reverbeat.io for consistency (same author surface):

1. **Scholarly over promotional.** Quiet typography, generous whitespace, minimal color palette.
2. **Reading-first.** Line length capped at ~70 characters. Large body text. High contrast.
3. **Apple-inspired typography.** 11px minimum floor, `font-display` class, consistent type scale.
4. **Dark mode via `data-theme="dark"`.** Match the convention used in other Syntharchy properties.
5. **No analytics bloat.** Plausible (already on other sites) is the maximum; no GA, no pixels, no cookie banners.
6. **No gated content.** Everything is public, everything is CC BY 4.0.

## Provenance stack

The defensive-publication claim rests on four externally verifiable layers:

1. **Signed git commits.** GitHub signs every commit made through the web UI or the Keystatic Cloud API. Dependabot and the OTS bot commit via GitHub's API and therefore sign automatically. CI enforces signed-commit verification on every pull request (`.github/workflows/ci.yml → verify-signatures`). Direct CLI commits from an unconfigured local machine are *not* signed; see Git discipline below.
2. **OpenTimestamps proofs.** Every MDX note is stamped to Bitcoin via the OTS calendar network, producing a `<file>.mdx.ots` sibling file. `.github/workflows/opentimestamps.yml` runs on every push to main that touches `content/**/*.mdx`, stamps the file, and commits the proof back. Proofs verify offline with the `ots` CLI; reader-facing instructions are at `/verify/<slug>`.
3. **SLSA build attestation.** Every push to main produces a Sigstore-signed attestation of `provenance.json` via `actions/attest-build-provenance`. The manifest enumerates every note's sha256, git commit, OTS proof path, and DOI at that commit. Verifiers can run `gh attestation verify provenance.json --repo juanlentino/research`.
4. **Zenodo DOIs.** Repo-level DOIs mint automatically on each GitHub release via Zenodo's native GitHub integration. Per-note DOIs mint on demand via the `zenodo-deposit` workflow (`workflow_dispatch` with topic + slug); the workflow PRs the DOI back into the note's frontmatter.

## OpenTimestamps workflow

Every new MDX note under `content/**/*.mdx` requires an OpenTimestamps proof (`.mdx.ots` sibling file). The proof is committed alongside the source and becomes the note's Bitcoin-anchored timestamp of record.

**Automated path (default).** The workflow at `.github/workflows/opentimestamps.yml` runs on every push to `main` that touches `content/**/*.mdx`. It installs the `opentimestamps-client` Python package, runs `ots stamp <file>` on each changed MDX, and pushes the resulting `.ots` files back to `main` as a `chore(ots): stamp changed MDX notes` commit authored by `ots-bot`. The commit is GitHub-signed (API-authored). Typical lag: under two minutes after push.

**Manual path (when needed).** If a proof is missing or needs regeneration:

```
pip install opentimestamps-client
ots stamp content/<topic>/<slug>.mdx
git add content/<topic>/<slug>.mdx.ots
git commit -m "ots(<topic>/<slug>): stamp source"
```

**Verification (reader-facing).** The `/verify/<slug>` page renders copy-paste commands; any reader with `ots verify` can confirm the Bitcoin-anchored timestamp without trusting this site. Verification remains valid even if GitHub, Vercel, and the OTS calendar servers all disappear — the Bitcoin blockchain is the ultimate source.

**Policy.** Never delete a `.ots` file. A broken or missing proof must be regenerated from the current MDX; if the source content itself has changed materially since the original proof, publish a new version (`/provenance/<slug>/v2`) rather than overwriting the timestamp record.

## Content hashing

Every published note has a SHA-256 of its MDX source recorded in the per-commit provenance manifest (`provenance.json`) generated by `scripts/provenance.mjs`. The manifest is:

- Rebuilt on every `npm run build` (via `prebuild`)
- Enumerated per note: `{ slug, topic, canonical_url, content_sha256, content_bytes, git_commit, git_commit_date, ots_proof, doi, ... }`
- Surfaced to readers in the site's per-note provenance panel and on `/verify/<slug>`
- SLSA-attested on every push to `main` via `actions/attest-build-provenance@v2` (subject: `provenance.json`)

The hash pins the exact bytes of the MDX source at a specific commit. Third parties can reproduce it with `shasum -a 256 content/<topic>/<slug>.mdx` after checking out the recorded `git_commit`. If the hash in the manifest doesn't match the hash computed from the file at that commit, the archive has been tampered with after the fact.

`provenance.json` itself is gitignored; it's an ephemeral build artifact. The authoritative record is the signed attestation + the git history.

## PDF snapshot workflow

Every published note has a rendered PDF snapshot at `public/pdf/<topic>/<slug>.pdf`, committed to the repo. The PDF is a self-contained reading artifact: if the site is offline forever and the MDX source is unparseable to a future reader, the PDF is still recoverable from git.

**How it runs.** `.github/workflows/generate-pdfs.yml` listens for `deployment_status` events. When Vercel reports a Production deploy as `success`, the workflow:

1. Installs dependencies (Puppeteer + headless Chromium)
2. Runs `npm run generate:pdfs` which navigates to `https://research.juanlentino.com/<topic>/<slug>` for each published note, emulates print media, strips site chrome, renders to A4 PDF
3. Commits the PDFs back to `main` as a `chore(pdfs): render published notes to PDF` commit authored by `pdf-bot`

**Lag.** PDFs for a new note appear on the *next* build after its initial deploy. `citation_pdf_url` emits conditionally in `lib/metadata.ts` — if the local PDF exists, Scholar picks up the URL; otherwise the tag is omitted until the PDF lands.

**Override.** Set `pdf_url` in MDX frontmatter to point `citation_pdf_url` at a different location (e.g. a Zenodo-hosted PDF). The local PDF is still rendered and committed, but Scholar sees the override.

**Manual generation.** `npm run generate:pdfs --base=http://localhost:3000` renders against a local dev server.

## New note checklist

Every new note — whether authored in Keystatic, GitHub web editor, or locally — should complete every item below before merging. The goal: on first deploy, the note has full Scholar metadata, an OTS proof on the way, a PDF on the way, and a clear path to a DOI.

1. **Frontmatter.** All required fields populated: `title`, `slug` (matches filename), `topic`, `date_published`, `date_updated`, `author`, `orcid`, `license`, `canonical_url` (slash-free, matches `/{topic}/{slug}`), `abstract` (40+ chars), `keywords` (2+), `version`, `status: published`, `changelog` with initial entry. Optional: `doi`, `pdf_url`.
2. **Filename = slug.** `content/<topic>/<slug>.mdx`. Slug is lowercase-alphanumeric-hyphen, no underscores.
3. **Local build passes.** `npm run build` succeeds — `validate:scholar` + `validate:feed` + `provenance` all green.
4. **Commit + push.** Commit message is a prior-art record: describe the publication event, not the file. Example: `publish(provenance): "On identifier mapping" (v1)`.
5. **Automatic follow-ups (no action needed):**
   - OTS bot stamps `.mdx.ots` → commits back (~1 min)
   - Vercel deploys → CI attests `provenance.json` (~3 min)
   - PDF bot renders `public/pdf/<topic>/<slug>.pdf` → commits back (~2 min after deploy)
   - Next build emits `citation_pdf_url` in the rendered `<head>`
6. **DOI mint (manual, one-click).** GitHub → Actions → `zenodo-deposit` → "Run workflow" → enter topic + slug → choose `sandbox: false` for a real DOI. Merge the resulting DOI PR; site rebuilds with DOI in `<head>` and provenance panel.
7. **Optional: companion publication.** If the note deserves a LinkedIn article or standards-body submission, record the cross-reference in the note's `changelog` or in a new `external_publications` field.

## SEO and academic metadata

Every note page renders the following `<meta>` tags via `lib/metadata.ts:buildNoteMetadata`:

**Google Scholar:**
- `citation_title`, `citation_author`, `citation_publication_date`
- `citation_journal_title` (= "research.juanlentino.com")
- `citation_doi` (when DOI is set in frontmatter)
- `citation_pdf_url` (when PDF exists)
- `citation_abstract_html_url`, `citation_language`, `citation_keywords`

**Dublin Core:**
- `DC.title`, `DC.creator`, `DC.date`, `DC.rights`, `DC.identifier`
- `DC.language`, `DC.type`, `DC.subject`
- `DC.identifier.doi` when present

Open Graph, Twitter Card, canonical `<link>`, and RSS discovery are emitted from the same function.

## Versioning policy

- **Typos, clarifications, reference additions:** silent in-place updates. Bump `date_updated` and append a `changelog` entry.
- **Substantive changes (rewrites, thesis shifts, retractions):** create a new version at `/provenance/<slug>/v2`. The previous URL 301-redirects to the versioned URL. The new version is canonical.
- **Never delete a note.** If retracted, set `status: retracted` in frontmatter; the URL stays live with a retraction notice.

## Git discipline

- **Signed commits, enforced on PRs.** CI refuses PRs containing unsigned commits. GitHub web, Keystatic Cloud, Dependabot, and OTS-bot commits all sign automatically (they go through the GitHub API). CLI commits from an unconfigured machine are not signed; direct push to main without signing will be blocked by branch protection once enabled.
- **Meaningful commit messages.** Each commit to a note's MDX is a timestamped prior-art record. Treat commit messages as scholarly provenance.
- **Squash only for infrastructure changes.** Content commits are preserved unsquashed to maintain timestamp granularity.

## Parallel publication to Zenodo

Every note is also deposited to Zenodo for DOI minting. The Zenodo record is the citable academic reference; research.juanlentino.com is the canonical reading surface.

Workflow per note:
1. Publish to research.juanlentino.com
2. Generate PDF snapshot (see build pipeline)
3. Dispatch `.github/workflows/zenodo-deposit.yml` with topic + slug
4. Zenodo mints DOI; workflow PRs the DOI back into the MDX
5. Merge; site rebuilds with DOI rendered in `<head>` and provenance panel

Repo-level DOIs on GitHub releases are handled automatically by Zenodo's GitHub integration (enabled).

## What Claude Code should and should not do

**Do:**
- Preserve the slash-free canonical URL form; redirect trailing-slash variants in `vercel.json`
- Keep Keystatic Cloud working — do not re-enable `output: 'export'`
- Validate Scholar metadata on every build (`scripts/validate-scholar.mjs`)
- Maintain the 4-layer provenance stack when adding features
- Respect CSP scoping: the site-wide CSP in `vercel.json` already allows the exact hosts Keystatic Cloud needs (`api.keystatic.cloud`, `api.github.com`, `*.githubusercontent.com`). Do not widen further without justification.
- Optimize build time and bundle size

**Do not:**
- Add analytics beyond Plausible
- Introduce a user-facing dynamic feature (auth, comments, submissions) — Keystatic admin is the only authenticated surface
- Publish anything to external services (Zenodo, LinkedIn, GitHub Releases) without explicit user confirmation
- Restructure URLs or change the topic-path scheme
- Add comments, discussions, or social features
- Use AI-generated hero images or illustrations
- Re-add `trailingSlash: true` to `next.config.mjs` — breaks Keystatic OAuth
- Upgrade Next.js, ESLint, or `@types/node` across major versions without an explicit migration task (Dependabot is configured to skip these)

## Author voice

Notes are written in Juan's voice: direct, technically rigorous, lightly opinionated, minimal hedging. See research.juanlentino.com/about for bio tone reference.

When drafting or editing prose in this repo, match:
- Active voice preferred
- Short sentences over long
- Minimal em-dashes (Juan's stated preference — under 2 per paragraph)
- No throat-clearing openers ("In today's world…", "As we all know…")
- Technical precision over rhetorical flourish
- Citations via footnotes, not inline hyperlinks in body text
