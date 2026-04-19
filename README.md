# research.juanlentino.com

Source repository for [research.juanlentino.com](https://research.juanlentino.com), a living archive of technical notes and defensive publications on music rights infrastructure, cryptographic provenance, and AI-era metadata systems.

## Author

**Juan Lentino**
Voting Member, The Recording Academy and The Latin Recording Academy
Founder, Panacea Studio
ORCID: [0009-0006-8151-5920](https://orcid.org/0009-0006-8151-5920)

## License

All content in this repository (`content/**`) is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) unless otherwise noted in the individual note. Attribution is required; commercial use is permitted; derivatives are permitted.

Source code (everything outside `content/`) is licensed under MIT. See [LICENSE](LICENSE).

## Citation

Each note is published with a canonical URL at `research.juanlentino.com/<topic>/<slug>` and a corresponding Zenodo DOI. Please cite the DOI for academic and standards-body references; the canonical URL is the preferred reading surface.

## Provenance

Every note sits on a four-layer defensive-publication stack:

1. **Signed git commits.** GitHub signs Keystatic, OTS-bot, and Dependabot commits. CI enforces signed commits on pull requests.
2. **OpenTimestamps.** Every `.mdx` file receives a Bitcoin-anchored `.mdx.ots` proof via `.github/workflows/opentimestamps.yml` on each push that touches content.
3. **SLSA build attestation.** `actions/attest-build-provenance` signs the per-commit `provenance.json` manifest (sha256 + git sha + OTS proof path + DOI per note) via Sigstore.
4. **Zenodo DOI.** Repo-level DOIs mint on each GitHub release via Zenodo's GitHub integration; per-note DOIs via the `zenodo-deposit` workflow.

Reader-facing verification at `/verify/<slug>` surfaces the sha256, commit, and OTS proof for any note with copy-paste verification commands.

## Structure

```
content/<topic>/<slug>.mdx
content/<topic>/<slug>.mdx.ots   # auto-committed by OTS workflow
```

Each MDX file includes YAML frontmatter with publication date, DOI, abstract, and keywords. See [CLAUDE.md](CLAUDE.md) for full schema.

## Stack

Next.js 15 App Router · MDX via `next-mdx-remote` · Tailwind CSS v4 · TypeScript strict · SSR on Vercel with per-route SSG · Keystatic Cloud for browser authoring · Cloudflare DNS

## Publishing

Three entry points, all producing identical signed-commit artifacts on `main`:

- **Browser (Keystatic):** [research.juanlentino.com/keystatic](https://research.juanlentino.com/keystatic) — schema-enforced admin UI backed by Keystatic Cloud.
- **GitHub web editor:** edit `.mdx` files directly on github.com/juanlentino/research or via `github.dev`.
- **Local:** `npm install && npm run dev` serves the site at `localhost:3000` and the admin at `localhost:3000/keystatic`.

## Repository policy

Content updates are tracked via git history. Every published note has a timestamped commit, and substantive revisions create new URL versions rather than overwriting prior text. This repository serves as a defensive publication record; its contents should not be deleted. See [SECURITY.md](SECURITY.md) for the responsible-disclosure process.

## Contact

For citation questions, standards-body collaboration, or research correspondence: juan@juanlentino.com
