import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import type { Note, NoteFrontmatter, TopicSummary } from "./types";

const CONTENT_ROOT = join(process.cwd(), "content");

// The build captures today's date once so every helper filters against
// the same reference — no drift between getNote and getNotesByTopic.
// Uses UTC date so the visibility rule matches the cron schedule that
// triggers nightly rebuilds.
const TODAY_ISO = new Date().toISOString().slice(0, 10);

function isHiddenBySchedule(fm: NoteFrontmatter): boolean {
  return Boolean(fm.scheduled_for && fm.scheduled_for > TODAY_ISO);
}

export const TOPICS: Record<string, Omit<TopicSummary, "noteCount">> = {
  provenance: {
    slug: "provenance",
    title: "Provenance",
    description:
      "Cryptographic authentication, attribution, and chain-of-custody systems for audio and creative works.",
  },
};

// Enumerate MDX files in a topic directory. Notes live flat at
// content/<topic>/<slug>.mdx regardless of publication status; visibility
// on reader-facing surfaces is gated by frontmatter `status` (and
// `scheduled_for`) via getNotesByTopic / getNote below.
function readTopicDir(topic: string): string[] {
  const dir = join(CONTENT_ROOT, topic);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

// Scholarly-prose reading pace. 220 wpm is a reasonable default for
// dense technical content; readers of this archive are not skimming.
const WORDS_PER_MINUTE = 220;

function computeReadingStats(body: string) {
  // Strip MDX syntax that doesn't count as prose words: code fences,
  // inline code, HTML/MDX tags, markdown link syntax, heading markers.
  const stripped = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/[#>*_~]/g, " ");
  const words = stripped.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  return { words, minutes };
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

  return {
    frontmatter,
    body: content,
    filepath,
    readingStats: computeReadingStats(content),
  };
}

export function getTopics(): TopicSummary[] {
  return Object.values(TOPICS).map((t) => ({
    ...t,
    noteCount: getNotesByTopic(t.slug).length,
  }));
}

// Reader-facing: excludes drafts (by frontmatter status), excludes
// notes whose scheduled_for date is still in the future, but keeps
// retracted notes visible so their URLs stay live with the
// retraction notice. Sorted newest-first.
export function getNotesByTopic(topic: string): Note[] {
  return readTopicDir(topic)
    .map((slug) => parseNote(topic, slug))
    .filter(
      (n) =>
        n.frontmatter.status !== "draft" && !isHiddenBySchedule(n.frontmatter),
    )
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
    if (isHiddenBySchedule(note.frontmatter)) return null;
    return note;
  } catch {
    return null;
  }
}

export function getTopicSlugs(): string[] {
  return Object.keys(TOPICS);
}
