export type NoteStatus = "draft" | "published" | "retracted";

export interface ChangelogEntry {
  date: string;
  change: string;
}

export interface NoteFrontmatter {
  title: string;
  slug: string;
  topic: string;
  date_published: string;
  date_updated: string;
  author: string;
  orcid: string;
  license: string;
  doi?: string;
  canonical_url: string;
  abstract: string;
  keywords: string[];
  version: number;
  status: NoteStatus;
  pdf_url?: string;
  changelog: ChangelogEntry[];
}

export interface Note {
  frontmatter: NoteFrontmatter;
  body: string;
  filepath: string;
}

export interface TopicSummary {
  slug: string;
  title: string;
  description: string;
  noteCount: number;
}
