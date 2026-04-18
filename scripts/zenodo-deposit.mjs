#!/usr/bin/env node
// Deposit a single note (MDX + PDF snapshot + .ots proof when present)
// to Zenodo and mint a DOI, then write the DOI back into the MDX
// frontmatter and emit the updated canonical_url / pdf_url.
//
// Usage:
//   ZENODO_TOKEN=xxx node scripts/zenodo-deposit.mjs <topic> <slug>
//   ZENODO_SANDBOX=true ZENODO_TOKEN=xxx node scripts/zenodo-deposit.mjs ...
//
// The API dance:
//   1. POST /api/deposit/depositions   → create empty deposition, get id + bucket
//   2. PUT  <bucket>/<filename>        → upload each file
//   3. PUT  /api/deposit/depositions/<id>  → attach metadata
//   4. POST /api/deposit/depositions/<id>/actions/publish  → mint DOI
//
// On success, writes the minted DOI into the MDX frontmatter and prints
// the conceptdoi + version DOI. The script is idempotent in the sense
// that re-running it (before publish) reuses the draft; after publish,
// Zenodo requires a new-version flow which this script does NOT attempt.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, basename } from "node:path";
import matter from "gray-matter";

const [, , topic, slug] = process.argv;
if (!topic || !slug) {
  console.error("usage: zenodo-deposit.mjs <topic> <slug>");
  process.exit(2);
}

const token = process.env.ZENODO_TOKEN;
if (!token) {
  console.error("ZENODO_TOKEN is required.");
  process.exit(2);
}

const sandbox = process.env.ZENODO_SANDBOX === "true";
const host = sandbox ? "https://sandbox.zenodo.org" : "https://zenodo.org";
const base = `${host}/api`;

const ROOT = process.cwd();
const mdxPath = join(ROOT, "content", topic, `${slug}.mdx`);
const pdfPath = join(ROOT, "artifacts", topic, `${slug}.pdf`);
const otsPath = `${mdxPath}.ots`;

if (!existsSync(mdxPath)) {
  console.error(`not found: ${mdxPath}`);
  process.exit(1);
}

const raw = readFileSync(mdxPath, "utf8");
const parsed = matter(raw);
const fm = parsed.data;

if (fm.doi) {
  console.log(`note already has DOI ${fm.doi} — skipping`);
  process.exit(0);
}

async function api(path, init = {}) {
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${init.method ?? "GET"} ${path} → ${res.status}\n${body}`);
  }
  return res.json();
}

async function uploadFile(bucketUrl, filePath) {
  const name = basename(filePath);
  const bytes = readFileSync(filePath);
  const res = await fetch(`${bucketUrl}/${encodeURIComponent(name)}`, {
    method: "PUT",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/octet-stream",
    },
    body: bytes,
  });
  if (!res.ok) {
    throw new Error(`upload ${name} → ${res.status} ${await res.text()}`);
  }
  console.log(`  uploaded ${name} (${bytes.length} bytes)`);
}

const metadata = {
  upload_type: "publication",
  publication_type: "workingpaper",
  title: fm.title,
  description: fm.abstract,
  creators: [
    {
      name: "Lentino, Juan",
      orcid: fm.orcid,
    },
  ],
  keywords: fm.keywords,
  publication_date: fm.date_published,
  license: (fm.license || "CC-BY-4.0").toLowerCase(),
  access_right: "open",
  language: "eng",
  related_identifiers: [
    { identifier: fm.canonical_url, relation: "isAlternateIdentifier", scheme: "url" },
  ],
  communities: [],
  version: `v${fm.version}`,
};

console.log(`creating deposition on ${host} ...`);
const dep = await api("/deposit/depositions", {
  method: "POST",
  body: JSON.stringify({}),
});
console.log(`  id: ${dep.id}`);

console.log("uploading files ...");
await uploadFile(dep.links.bucket, mdxPath);
if (existsSync(pdfPath)) {
  await uploadFile(dep.links.bucket, pdfPath);
} else {
  console.log(`  (no PDF snapshot at ${pdfPath} — skipping)`);
}
if (existsSync(otsPath)) {
  await uploadFile(dep.links.bucket, otsPath);
} else {
  console.log(`  (no OTS proof at ${otsPath} — skipping)`);
}

console.log("attaching metadata ...");
await api(`/deposit/depositions/${dep.id}`, {
  method: "PUT",
  body: JSON.stringify({ metadata }),
});

console.log("publishing ...");
const published = await api(
  `/deposit/depositions/${dep.id}/actions/publish`,
  { method: "POST" },
);

const doi = published.doi;
const conceptDoi = published.conceptdoi ?? null;
console.log(`  DOI: ${doi}`);
if (conceptDoi) console.log(`  concept DOI: ${conceptDoi}`);

fm.doi = doi;
fm.pdf_url = `${host}/records/${published.record_id}/files/${slug}.pdf`;

const updatedMdx = matter.stringify(parsed.content, fm);
writeFileSync(mdxPath, updatedMdx);
console.log(`wrote DOI back to ${mdxPath}`);
