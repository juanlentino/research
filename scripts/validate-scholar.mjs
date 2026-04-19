#!/usr/bin/env node
// Validate that every MDX note in content/ has the frontmatter fields
// required for Google Scholar indexing and Zenodo DOI cross-referencing.
// Exits non-zero on any failure so CI blocks the merge.

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
  "changelog",
];

const ORCID = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const SITE_URL = "https://research.juanlentino.com";

const root = join(process.cwd(), "content");
const topics = readdirSync(root, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

let failures = 0;

for (const topic of topics) {
  const dir = join(root, topic);
  const files = readdirSync(dir).filter(
    (f) => f.endsWith(".mdx") && !f.startsWith("_"),
  );

  for (const file of files) {
    const path = join(dir, file);
    const { data: fm } = matter(readFileSync(path, "utf8"));
    const errs = [];
    const slug = file.replace(/\.mdx$/, "");

    for (const field of REQUIRED) {
      if (fm[field] == null || fm[field] === "") {
        errs.push(`missing field: ${field}`);
      }
    }

    if (fm.slug && fm.slug !== slug) {
      errs.push(`slug "${fm.slug}" does not match filename "${slug}"`);
    }
    if (fm.topic && fm.topic !== topic) {
      errs.push(`topic "${fm.topic}" does not match directory "${topic}"`);
    }
    if (fm.orcid && !ORCID.test(fm.orcid)) {
      errs.push(`invalid ORCID format: ${fm.orcid}`);
    }
    if (fm.date_published && !ISO_DATE.test(fm.date_published)) {
      errs.push(`date_published must be YYYY-MM-DD: ${fm.date_published}`);
    }
    if (fm.date_updated && !ISO_DATE.test(fm.date_updated)) {
      errs.push(`date_updated must be YYYY-MM-DD: ${fm.date_updated}`);
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

    if (errs.length) {
      failures += 1;
      console.error(`✗ ${topic}/${file}`);
      for (const e of errs) console.error(`  · ${e}`);
    } else {
      console.log(`✓ ${topic}/${file}`);
    }
  }
}

if (failures > 0) {
  console.error(`\n${failures} note(s) failed Scholar validation.`);
  process.exit(1);
}
console.log("\nAll notes pass Scholar validation.");
