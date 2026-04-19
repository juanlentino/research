import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import type { Note, NoteFrontmatter, TopicSummary } from "./types";

const CONTENT_ROOT = join(process.cwd(), "content");

export const TOPICS: Record<string, Omit<TopicSummary, "noteCount">> = {
  provenance: {
    slug: "provenance",
    title: "Provenance",
    description:
      "Cryptographic authentication, attribution, and chain-of-custody systems for audio and creative works.",
  },
};

// Files starting with _ are treated as hidden (e.g. _drafts/), and
// directories with the same prefix are skipped entirely. Anything under a
// _drafts/ subdirectory is excluded from all reader-facing surfaces even
// when tracked in git.
function readTopicDir(topic: string): string[] {
  const dir = join(CONTENT_ROOT, topic);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".mdx") && !f.startsWith("_"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

function parseNote(topic: string, slug: string): Note {
  const filepath = join(CONTENT_ROOT, topic, `${slug}.mdx`);
  const raw = readFileSync(filepath, "utf8");
  const { data, content } = matter(raw);
  const frontmatter = data as NoteFrontmatter;

  if (frontmatter.slug !== slug) {
    throw new Error(
      `Frontmatter slug "${frontmatter.slug}" does not match filename "${slug}" in ${filepath}`,
    );
  }
  if (frontmatter.topic !== topic) {
    throw new Error(
      `Frontmatter topic "${frontmatter.topic}" does not match directory "${topic}" in ${filepath}`,
    );
  }

  return { frontmatter, body: content, filepath };
}

export function getTopics(): TopicSummary[] {
  return Object.values(TOPICS).map((t) => ({
    ...t,
    noteCount: getNotesByTopic(t.slug).length,
  }));
}

// Reader-facing: excludes drafts (by status and by _drafts/ path) but
// keeps retracted notes visible so their URLs stay live with the
// retraction notice. Sorted newest-first.
export function getNotesByTopic(topic: string): Note[] {
  return readTopicDir(topic)
    .map((slug) => parseNote(topic, slug))
    .filter((n) => n.frontmatter.status !== "draft")
    .sort((a, b) =>
      b.frontmatter.date_published.localeCompare(a.frontmatter.date_published),
    );
}

export function getAllNotes(): Note[] {
  return Object.keys(TOPICS)
    .flatMap((t) => getNotesByTopic(t))
    .sort((a, b) =>
      b.frontmatter.date_published.localeCompare(a.frontmatter.date_published),
    );
}

export function getNote(topic: string, slug: string): Note | null {
  try {
    const note = parseNote(topic, slug);
    if (note.frontmatter.status === "draft") return null;
    return note;
  } catch {
    return null;
  }
}

export function getTopicSlugs(): string[] {
  return Object.keys(TOPICS);
}
