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

Each MDX file includes YAML frontmatter with publication date, DOI, abstract, and keywords. See [ARCHITECTURE.md](ARCHITECTURE.md) for full schema and the complete technical reference.

## Stack

Next.js 15 App Router · MDX via `next-mdx-remote` · Tailwind CSS v4 · TypeScript strict · SSR on Vercel with per-route SSG · Keystatic Cloud for browser authoring · Cloudflare DNS

## Publishing

Three entry points, all producing identical signed-commit artifacts on `main`:

- **Browser (Keystatic):** [research.juanlentino.com/keystatic](https://research.juanlentino.com/keystatic) — schema-enforced admin UI backed by Keystatic Cloud.
- **GitHub web editor:** edit `.mdx` files directly on github.com/juanlentino/research or via `github.dev`.
- **Local:** `npm install && npm run dev` serves the site at `localhost:3000` and the admin at `localhost:3000/keystatic`.

## Local development setup (fresh machine)

```
git clone https://github.com/juanlentino/research.git
cd research
npm install
npm run dev            # site at localhost:3000, admin at localhost:3000/keystatic
```

Optional local files (not in git — restore from your backup on a new machine):

- `CLAUDE.md` — Claude Code instructions (AI-tooling config). Place at repo root.
- `schedule.md` — editorial cadence and campaign calendar. Place at repo root.

Neither file is required to build or serve the site. They only affect AI sessions and editorial planning.

### Enable commit signing (recommended)

CI enforces signed commits on pull requests. Without local signing, your own CLI commits will fail the PR gate. GitHub web, Keystatic, and bot commits already sign via the GitHub API — this only matters for direct-to-terminal work.

```
# Generate an SSH key for signing (if you don't have one reserved)
ssh-keygen -t ed25519 -C "juan@juanlentino.com" -f ~/.ssh/id_ed25519_signing

# Add the public key to GitHub as a Signing Key
# https://github.com/settings/ssh/new — select "Signing Key" (not Authentication)
cat ~/.ssh/id_ed25519_signing.pub

# Tell git to use SSH signing globally
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519_signing.pub
git config --global commit.gpgsign true
```

Commit something trivial; `git log --show-signature -1` should print `Good "git" signature`. GitHub will render the commit with a `Verified` badge.

### Environment variables

Production (Vercel dashboard → Settings → Environment Variables):

| Name | Purpose |
|------|---------|
| `VERCEL_DEPLOY_HOOK_URL` | Used by the daily scheduled-publish workflow to ping a rebuild |
| `ZENODO_TOKEN` | Production Zenodo API token for per-note DOI minting |
| `ZENODO_SANDBOX_TOKEN` | Sandbox Zenodo token for dry-run DOI deposits |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Optional — set to `research.juanlentino.com` to enable Plausible analytics |
| `NEXT_PUBLIC_PLAUSIBLE_SRC` | Optional — override the Plausible script URL for self-hosted instances |

No local env vars are required for development.

## Repository policy

Content updates are tracked via git history. Every published note has a timestamped commit, and substantive revisions create new URL versions rather than overwriting prior text. This repository serves as a defensive publication record; its contents should not be deleted. See [SECURITY.md](SECURITY.md) for the responsible-disclosure process.

## Contact

For citation questions, standards-body collaboration, or research correspondence: juan@juanlentino.com
