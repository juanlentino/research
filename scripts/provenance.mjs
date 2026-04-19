#!/usr/bin/env node
// Build provenance.json — a canonical, signable manifest of every published
// note and its verifiable identifiers. Consumed by CI, the reader-facing
// /verify/<slug>/ pages, and third parties who want to audit the archive.

import { createHash } from "node:crypto";
import {
  readdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
} from "node:fs";
import { join, relative } from "node:path";
import { execFileSync } from "node:child_process";
import matter from "gray-matter";

// YAML parses unquoted `YYYY-MM-DD` as a native timestamp, so gray-matter
// returns those fields as Date objects. Keystatic Cloud writes dates
// unquoted — coerce back to `YYYY-MM-DD` strings so the manifest stores
// stable short dates instead of full ISO-8601 timestamps with time.
function normalizeFrontmatterDates(data) {
  const toIso = (v) =>
    v instanceof Date && !Number.isNaN(v.getTime())
      ? v.toISOString().slice(0, 10)
      : v;
  const out = { ...data };
  for (const k of ["date_published", "date_updated", "scheduled_for"]) {
    out[k] = toIso(out[k]);
  }
  if (Array.isArray(out.changelog)) {
    out.changelog = out.changelog.map((e) =>
      e && typeof e === "object" ? { ...e, date: toIso(e.date) } : e,
    );
  }
  return out;
}

const ROOT = process.cwd();
const CONTENT = join(ROOT, "content");
const OUT_PATH = join(ROOT, "provenance.json");

function sha256(buf) {
  return createHash("sha256").update(buf).digest("hex");
}

function git(...args) {
  try {
    return execFileSync("git", args, {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

function gitLast(fileRel) {
  const sha = git("log", "-n", "1", "--format=%H", "--", fileRel);
  if (!sha) return { commit: null, commit_date: null };
  const date = git("log", "-n", "1", "--format=%aI", "--", fileRel);
  return { commit: sha, commit_date: date || null };
}

function collectTopics() {
  return readdirSync(CONTENT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

function collectNotes() {
  const entries = [];
  for (const topic of collectTopics()) {
    const dir = join(CONTENT, topic);
    const files = readdirSync(dir).filter((f) => f.endsWith(".mdx"));
    for (const file of files) {
      const abs = join(dir, file);
      const rel = relative(ROOT, abs);
      const bytes = readFileSync(abs);
      const { data: raw } = matter(bytes.toString("utf8"));
      const fm = normalizeFrontmatterDates(raw);
      // Drafts live in git (and get OTS proofs on commit) but are
      // excluded from the signed manifest until their status flips to
      // published. The attestation covers the published archive state,
      // matching getNotesByTopic / getAllNotes.
      if (fm.status === "draft") continue;
      const { commit, commit_date } = gitLast(rel);
      const otsPath = `${rel}.ots`;
      const otsExists = existsSync(join(ROOT, otsPath));

      entries.push({
        slug: fm.slug,
        topic: fm.topic,
        title: fm.title,
        version: fm.version,
        canonical_url: fm.canonical_url,
        doi: fm.doi ?? null,
        status: fm.status ?? "published",
        date_published: fm.date_published,
        date_updated: fm.date_updated,
        content_path: rel,
        content_sha256: sha256(bytes),
        content_bytes: bytes.length,
        git_commit: commit,
        git_commit_date: commit_date,
        ots_proof: otsExists ? otsPath : null,
      });
    }
  }
  entries.sort((a, b) => a.canonical_url.localeCompare(b.canonical_url));
  return entries;
}

function build() {
  const notes = collectNotes();
  const head = git("rev-parse", "HEAD");
  const manifest = {
    $schema: "https://research.juanlentino.com/schemas/provenance-v1.json",
    generated_at: new Date().toISOString(),
    repo: "https://github.com/juanlentino/research",
    head_commit: head || null,
    note_count: notes.length,
    notes,
  };

  const body = JSON.stringify(manifest, null, 2) + "\n";
  writeFileSync(OUT_PATH, body);
  const manifestHash = sha256(Buffer.from(body));

  console.log(`wrote ${relative(ROOT, OUT_PATH)}`);
  console.log(`  notes:         ${notes.length}`);
  console.log(`  head_commit:   ${manifest.head_commit ?? "(no git)"}`);
  console.log(`  manifest_hash: ${manifestHash}`);
}

build();
