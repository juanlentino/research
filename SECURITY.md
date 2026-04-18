# Security policy

## Scope

`research.juanlentino.com` is a static site. There is no backend, no database, no authentication, and no user-submitted data. The threat surface is:

1. The GitHub repository (source of truth, signed commits)
2. The GitHub Actions build pipeline
3. The Vercel deployment
4. The Cloudflare DNS + edge layer
5. The `npm` dependency graph

Reports covering any of the above are in scope.

## Reporting a vulnerability

Email **juan@juanlentino.com** with the subject line `SECURITY:` followed by a short summary. Include:

- Affected URL or asset
- Reproduction steps
- Expected vs. observed behavior
- Your contact info for follow-up

I will acknowledge receipt within 72 hours. Please do not open a public GitHub issue for security matters.

For sensitive findings, use the GitHub private vulnerability reporting endpoint on this repository.

## Integrity controls

- All commits to `main` are signed (GPG or SSH-signed).
- Dependency updates are handled via Dependabot with weekly cadence.
- The build pipeline runs `npm audit --audit-level=high` and blocks on failure.
- Build provenance attestations are generated via `actions/attest-build-provenance` on every release.
- The deployed site enforces CSP, HSTS (with preload), X-Content-Type-Options, Referrer-Policy, and COOP/CORP headers. See `vercel.json`.
- No third-party analytics, trackers, or advertising scripts are loaded.

## Defensive-publication integrity

Notes in `content/` are never deleted. Retractions are marked in-place with a retraction notice and a changelog entry. Substantive revisions create new versioned URLs; the prior URL redirects to the new version. The git history is the authoritative timestamp record; if a published note is altered after publication, the diff is part of the public record.

If you believe a published note has been silently altered in a way that invalidates its prior-art value, please report it via the same channel.
