import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export interface ProvenanceEntry {
  slug: string;
  topic: string;
  title: string;
  version: number;
  canonical_url: string;
  doi: string | null;
  status: "published" | "retracted";
  date_published: string;
  date_updated: string;
  content_path: string;
  content_sha256: string;
  content_bytes: number;
  git_commit: string | null;
  git_commit_date: string | null;
  ots_proof: string | null;
}

export interface ProvenanceManifest {
  $schema: string;
  generated_at: string;
  repo: string;
  head_commit: string | null;
  note_count: number;
  notes: ProvenanceEntry[];
}

const MANIFEST_PATH = join(process.cwd(), "provenance.json");

let cache: ProvenanceManifest | null = null;

export function loadManifest(): ProvenanceManifest | null {
  if (cache) return cache;
  if (!existsSync(MANIFEST_PATH)) return null;
  cache = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
  return cache;
}

export function getProvenance(topic: string, slug: string): ProvenanceEntry | null {
  const m = loadManifest();
  if (!m) return null;
  return m.notes.find((n) => n.topic === topic && n.slug === slug) ?? null;
}
