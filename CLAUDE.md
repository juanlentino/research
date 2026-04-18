# CLAUDE.md

Project context for Claude Code. Read before making changes.

## Purpose

This repository hosts **research.juanlentino.com**, a living body of technical notes, defensive publications, and long-form writing on music rights infrastructure, cryptographic provenance, and AI-era metadata systems.

Author: Juan Lentino. Voting member, The Recording Academy and The Latin Recording Academy. Founder, Panacea Studio. MBA candidate (Applied AI in Business), Westcliff University.

## What this repo is

- A Next.js 15 static site hosting MDX-based technical notes
- A defensive publication archive, with git history serving as a timestamped prior-art record
- A citation target for academic and industry researchers (Google Scholar indexed, Zenodo DOI cross-referenced, CC BY 4.0 licensed)

## What this repo is not

- A blog. The tone is technical and scholarly, not conversational.
- A product landing page. It does not advertise ReverBeat, Panacea, or any commercial offering directly.
- A dynamic application. No backend, no database, no authentication. Static generation only.

## URL structure

```
research.juanlentino.com/                          landing page
research.juanlentino.com/about/                    bio, affiliations, ORCID
research.juanlentino.com/provenance/               provenance topic index
research.juanlentino.com/provenance/<slug>/        individual provenance note
research.juanlentino.com/<future-topic>/           new topic when added
research.juanlentino.com/feed.xml                  global RSS
research.juanlentino.com/provenance/feed.xml       topic-specific RSS
research.juanlentino.com/sitemap.xml               SEO sitemap
```

**Critical: do not restructure URLs without explicit instruction.** Every URL in this site is a potential citation target. Changes break inbound links, Google Scholar indexing, and defensive-publication timestamps.

## Content layout

```
content/
├── provenance/
│   ├── <slug>.mdx
│   └── ...
└── <future-topic>/
    └── ...
```

## MDX frontmatter

Every note must include this frontmatter. Missing fields break Scholar indexing.

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
doi: "10.5281/zenodo.XXXXXXX"
canonical_url: "https://research.juanlentino.com/provenance/<slug>/"
abstract: "200-word abstract here."
keywords:
  - provenance
  - cryptographic-authentication
  - music-rights
version: 1
changelog:
  - date: "YYYY-MM-DD"
    change: "Initial publication"
---
```

## Tech stack

- Next.js 15 (App Router)
- MDX for content (via `@next/mdx` or `contentlayer`)
- Tailwind CSS for styling
- TypeScript strict mode
- Static generation only (`output: 'export'` or `generateStaticParams` for all routes)
- Deployed to Vercel (Syntharchy team)
- DNS via Cloudflare

## Design principles

Borrow aesthetic cues from reverbeat.io for consistency (same author surface):

1. **Scholarly over promotional.** Quiet typography, generous whitespace, minimal color palette.
2. **Reading-first.** Line length capped at ~70 characters. Large body text. High contrast.
3. **Apple-inspired typography.** 11px minimum floor, font-display class, consistent type scale.
4. **Dark mode via `data-theme="dark"`.** Match the convention used in the other Syntharchy properties.
5. **No analytics bloat.** Plausible (already on other sites) is the maximum; no GA, no pixels, no cookie banners.
6. **No gated content.** Everything is public, everything is CC BY 4.0.

## SEO and academic metadata

Every page must render these `<meta>` tags for Google Scholar indexing:

- `citation_title`
- `citation_author`
- `citation_publication_date`
- `citation_journal_title` (set to "research.juanlentino.com")
- `citation_pdf_url` (link to PDF version)
- `citation_doi` (Zenodo DOI)

Plus standard Open Graph and Twitter Card tags, plus Dublin Core (`DC.title`, `DC.creator`, `DC.date`, `DC.rights`, `DC.identifier`).

## Versioning policy

- **Typos, clarifications, reference additions:** silent in-place updates. Bump `date_updated` and `changelog`.
- **Substantive changes (rewrites, thesis shifts, retractions):** create a new version at `/provenance/<slug>/v2/`. The previous URL redirects to the versioned URL. The new version is canonical.
- **Never delete a note.** If retracted, mark `status: retracted` in frontmatter, keep the URL live with a retraction notice.

## Git discipline

- **Signed commits.** Configure `git config commit.gpgsign true` and verify email matches GitHub's verified address.
- **Meaningful commit messages.** Each commit to a note's MDX is a timestamped prior-art record. Treat commit messages as scholarly provenance.
- **Squash only for infrastructure changes.** Content commits are preserved unsquashed to maintain timestamp granularity.

## Parallel publication to Zenodo

Every note is also deposited to Zenodo for DOI minting. The Zenodo record is the citable academic reference; research.juanlentino.com is the canonical reading surface.

Workflow per note:
1. Publish to research.juanlentino.com
2. Upload PDF snapshot to Zenodo
3. Zenodo mints DOI
4. Update MDX frontmatter with DOI
5. Redeploy

## What Claude Code should and should not do

**Do:**
- Scaffold Next.js setup with MDX, metadata injection, RSS, sitemap
- Generate per-note template files on request
- Write migration scripts if the URL structure ever changes (never without explicit instruction)
- Validate Scholar metadata on every build
- Optimize build time and bundle size

**Do not:**
- Add analytics beyond Plausible
- Introduce a CMS, backend, or database
- Publish anything to external services (Zenodo, LinkedIn, etc.) without explicit user confirmation
- Restructure URLs or change the topic-path scheme
- Add comments, discussions, or social features
- Use AI-generated hero images or illustrations

## Author voice

Notes are written in Juan's voice: direct, technically rigorous, lightly opinionated, minimal hedging. See research.juanlentino.com/about for bio tone reference.

When drafting or editing prose in this repo, match:
- Active voice preferred
- Short sentences over long
- Minimal em-dashes (Juan's stated preference — under 2 per paragraph)
- No throat-clearing openers ("In today's world...", "As we all know...")
- Technical precision over rhetorical flourish
- Citations via footnotes, not inline hyperlinks in body text
