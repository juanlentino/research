# schedule.md

Publishing cadence and roadmap for research.juanlentino.com through the 2026 campaign (end target: 2026-11-30).

**Cadence:** bi-weekly on Sundays. Companion LinkedIn article anchors the first week. One content blackout (MBA final sprint) in late Jul – Aug. Thirteen notes planned end-to-end.

**Status:** Phase 0 foundation complete ahead of schedule. Note 1 scaffolded. LinkedIn article drafting window opens 2026-04-27.

---

## Completed (shipped ahead of schedule)

| Date | Item | Artifact |
|------|------|----------|
| 2026-04-18 | Repository scaffold (Next.js 15 + MDX + Keystatic Cloud) | [github.com/juanlentino/research](https://github.com/juanlentino/research) |
| 2026-04-18 | DNS + Vercel production deploy | [research.juanlentino.com](https://research.juanlentino.com) |
| 2026-04-18 | Welcome note (meta-note on archive structure) | [/provenance/welcome](https://research.juanlentino.com/provenance/welcome) |
| 2026-04-18 | Provenance stack (signed commits + OTS + SLSA + Zenodo) | 4 workflows + `provenance.json` manifest |
| 2026-04-18 | Site hardening (CSP, HSTS, CITATION.cff, RSS validator) | [vercel.json](vercel.json), [CITATION.cff](CITATION.cff) |
| 2026-04-18 | PDF snapshot pipeline (Puppeteer + deploy-hook workflow) | [.github/workflows/generate-pdfs.yml](.github/workflows/generate-pdfs.yml) |
| 2026-04-18 | Scheduled-publish infrastructure (daily cron + Vercel hook) | [.github/workflows/scheduled-publish.yml](.github/workflows/scheduled-publish.yml) |
| 2026-04-18 | Note 1 draft scaffold (identifier-mapping outline) | `content/provenance/_drafts/identifier-mapping.mdx` |

Velocity win: the Phase-1 Weeks-1-2 foundation block — originally allocated Apr 19 – May 3 — finished on Apr 18, one day into the campaign window.

---

## Phase 1 — Foundation & first LinkedIn article (Apr 19 – May 3)

**Week 1 (Apr 20 – Apr 26)**
- Monitor first automated workflows (OTS bot, PDF bot, scheduled-publish) under real usage.
- Draft LinkedIn article: "Defensive publication for the music-rights era — why I'm building research.juanlentino.com." Target ~1200 words, links to welcome note and explains the OTS/Zenodo/SLSA stack in plain language.
- Finalize Note 1 prose (promote from `_drafts/` by Wed Apr 29).

**Week 2 (Apr 27 – May 3)**
- **Publish LinkedIn article** — Fri May 1 (compressed from originally Week 2-3 / May 3-10).
- Note 1 final-pass proofread. Schedule with `scheduled_for: 2026-05-10`.
- Trigger `zenodo-deposit` (sandbox first, then production) to mint Note 1's DOI; merge DOI PR so the note ships with DOI in `<head>`.

---

## Phase 2 — First-wave publishing (May 4 – Jul 19)

Bi-weekly Sunday publishes. Notes 2–6 build the conceptual spine of the provenance-tokens thesis before the MBA blackout.

| # | Date | Working title | Status |
|---|------|--------------|--------|
| 1 | **Sun May 10** | Provenance tokens as a substrate for music identifier mapping | Scheduled (draft in git) |
| 2 | Sun May 24 | TBD — candidate: content-addressed identifiers, conceptual model | Unscheduled |
| 3 | Sun Jun 7 | TBD — candidate: cryptographic signatures for works + performers | Unscheduled |
| 4 | Sun Jun 21 | TBD — candidate: timestamping protocols (OTS, blockchain, notaries) | Unscheduled |
| 5 | Sun Jul 5 | TBD — candidate: C2PA / Content Credentials in music | Unscheduled |
| 6 | Sun Jul 19 | TBD — candidate: DDEX ERN extensions for provenance | Unscheduled |

Working titles are candidate topics aligned with the Note 1 outline's downstream sections; each may shift based on external developments (standards-body activity, AI-rights litigation, etc.).

---

## Blackout — MBA final sprint (Jul 20 – Aug 22)

No notes published during this window. The daily scheduled-publish cron continues running; it's a no-op if nothing is due. OTS bot, PDF bot, and Dependabot keep operating — the archive stays healthy without active authoring.

Use this window to:
- Capture research-in-flight notes in `_drafts/` (tracked in git, excluded from build)
- Queue any time-sensitive pieces with `scheduled_for: 2026-08-23` or later

---

## Phase 3 — Second-wave publishing (Aug 24 – Nov 30)

Seven notes covering standards-body integration, AI-era specifics, and the campaign retrospective.

| # | Date | Working title | Status |
|---|------|--------------|--------|
| 7 | Sun Aug 30 | TBD — candidate: CISAC ISWC-Net modernization | Unscheduled |
| 8 | Sun Sep 13 | TBD — candidate: MLC dispute mechanics under a provenance regime | Unscheduled |
| 9 | Sun Sep 27 | TBD — candidate: AI-generated works + provenance | Unscheduled |
| 10 | Sun Oct 11 | TBD — candidate: sample clearance via cryptographic traces | Unscheduled |
| 11 | Sun Oct 25 | TBD — candidate: master/sync licensing with verifiable rights | Unscheduled |
| 12 | Sun Nov 8 | TBD — candidate: metadata standards harmonization | Unscheduled |
| 13 | **Sun Nov 22** | TBD — candidate: campaign retrospective + path forward | Unscheduled |

**End-of-campaign milestone: 2026-11-30.** By this date: 13 notes published, repo-level Zenodo DOI minted via GitHub release, optional SSRN cross-deposit of the full archive.

---

## Status tracker

| Metric | Value | Target |
|--------|-------|--------|
| Notes published (live on site) | 1 | 13 by Nov 30 |
| Notes scheduled (in git, hidden until date) | 0 | — |
| Notes drafted (in `_drafts/`) | 1 | — |
| DOIs minted | 0 (welcome has no DOI yet) | ≥13 by Nov 30 |
| OTS proofs committed | 1 (welcome.mdx.ots) | 1 per MDX |
| Companion LinkedIn articles | 0 | 1 published May 1; occasional follow-ups |

Update this table on every publish or retraction.

---

## Operating notes

- **Publish day rhythm.** Notes are scheduled for Sunday; the cron runs at 12:00 UTC (07:00 ET EDT / 08:00 ET EST) — so a Sunday-dated note goes live Sunday morning ET. No manual action required on publish day if `scheduled_for` is set correctly.
- **Advance authoring.** Notes can and should be drafted days or weeks before their scheduled date. The OTS proof timestamps the commit, not the release — which strengthens the defensive-publication claim (you demonstrably had the work before you released it).
- **Cross-deposit to SSRN.** Per-note `ssrn_url` frontmatter field is available. SSRN cross-deposit is a per-note decision, not campaign-wide. Make it for notes where the audience is academic and legal, skip for pure engineering notes.
- **DOI discipline.** Every published note should have a DOI within 7 days of publish. The `zenodo-deposit` workflow handles this; the bottleneck is reviewing + merging the DOI PR.

---

## Changelog

- **2026-04-19** — Initial schedule drafted. Phase-1 scaffold items marked complete. Note 1 compressed from May 17 → May 10. LinkedIn article pulled from Week 2-3 → Week 1 (May 1). Downstream dates recomputed on bi-weekly Sunday cadence. MBA blackout Jul 20 – Aug 22 preserved. Nov 30 end target preserved.
