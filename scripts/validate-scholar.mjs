#!/usr/bin/env node
// Validate that every MDX note in content/ has the frontmatter fields
// required for Google Scholar indexing and Zenodo DOI cross-referencing.
// Exits non-zero on any failure so CI blocks the merge.
//
// Scans content/<topic>/*.mdx. Files in _drafts/ subdirectories are
// intentionally skipped — drafts are tracked in git but excluded from
// the build surface and not subject to Scholar requirements. Files
// beginning with _ are skipped for the same reason.
//
// Failure messages are specific by design: CI output should tell the
// author exactly which field failed and why, not just "validation failed".

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

const REQUIRED = [
  "title",
  "slug",
  "topic",
  "date_published",
  "date_updated",
  "author",
  "orcid",
  "license",
  "canonical_url",
  "abstract",
  "keywords",
  "version",
  "status",
  "changelog",
];

const ALLOWED_STATUS = ["draft", "published", "retracted"];
const ORCID = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;
const SITE_URL = "https://research.juanlentino.com";

const root = join(process.cwd(), "content");
const topics = readdirSync(root, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
  .map((d) => d.name);

let failures = 0;
let published = 0;
let drafts = 0;

for (const topic of topics) {
  const dir = join(root, topic);
  const files = readdirSync(dir).filter((f) => {
    if (!f.endsWith(".mdx")) return false;
    if (f.startsWith("_")) return false;
    return true;
  });

  for (const file of files) {
    const path = join(dir, file);
    const { data: fm } = matter(readFileSync(path, "utf8"));
    const errs = [];
    const slug = file.replace(/\.mdx$/, "");

    if (!SLUG_RE.test(slug)) {
      errs.push(
        `filename slug "${slug}" must match ${SLUG_RE} (lowercase alphanumeric + hyphens)`,
      );
    }

    for (const field of REQUIRED) {
      const v = fm[field];
      const empty =
        v == null ||
        v === "" ||
        (Array.isArray(v) && v.length === 0);
      if (empty) {
        errs.push(`missing required field: ${field}`);
      }
    }

    if (fm.slug && fm.slug !== slug) {
      errs.push(`slug "${fm.slug}" does not match filename "${slug}"`);
    }
    if (fm.topic && fm.topic !== topic) {
      errs.push(`topic "${fm.topic}" does not match directory "${topic}"`);
    }
    if (fm.status && !ALLOWED_STATUS.includes(fm.status)) {
      errs.push(
        `status "${fm.status}" must be one of ${ALLOWED_STATUS.join(", ")}`,
      );
    }
    if (fm.orcid && !ORCID.test(fm.orcid)) {
      errs.push(`invalid ORCID format: ${fm.orcid} (expected NNNN-NNNN-NNNN-NNNN)`);
    }
    if (fm.date_published && !ISO_DATE.test(fm.date_published)) {
      errs.push(`date_published must be YYYY-MM-DD: ${fm.date_published}`);
    }
    if (fm.date_updated && !ISO_DATE.test(fm.date_updated)) {
      errs.push(`date_updated must be YYYY-MM-DD: ${fm.date_updated}`);
    }
    if (fm.date_updated && fm.date_published && fm.date_updated < fm.date_published) {
      errs.push(
        `date_updated (${fm.date_updated}) is before date_published (${fm.date_published})`,
      );
    }
    if (fm.canonical_url) {
      const expected = `${SITE_URL}/${topic}/${slug}`;
      if (fm.canonical_url !== expected) {
        errs.push(`canonical_url should be "${expected}", got "${fm.canonical_url}"`);
      }
    }
    if (fm.abstract && fm.abstract.length < 40) {
      errs.push(`abstract too short (${fm.abstract.length} chars; min 40)`);
    }
    if (fm.keywords && (!Array.isArray(fm.keywords) || fm.keywords.length < 2)) {
      errs.push("keywords must be an array with at least 2 entries");
    }
    if (fm.version != null && (!Number.isInteger(fm.version) || fm.version < 1)) {
      errs.push(`version must be a positive integer, got ${JSON.stringify(fm.version)}`);
    }
    if (fm.changelog && !Array.isArray(fm.changelog)) {
      errs.push("changelog must be an array");
    }

    if (errs.length) {
      failures += 1;
      console.error(`✗ ${topic}/${file}`);
      for (const e of errs) console.error(`  · ${e}`);
    } else {
      const label = fm.status === "draft" ? "(draft, excluded from build)" : "";
      console.log(`✓ ${topic}/${file} ${label}`);
      if (fm.status === "draft") drafts += 1;
      else published += 1;
    }
  }
}

if (failures > 0) {
  console.error(`\n${failures} note(s) failed Scholar validation.`);
  process.exit(1);
}
console.log(`\nAll notes pass: ${published} published, ${drafts} drafts.`);
