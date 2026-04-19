import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import type { NoteFrontmatter } from "./types";
import { SITE } from "./site";

function resolvePdfUrl(fm: NoteFrontmatter): string | null {
  if (fm.pdf_url) return fm.pdf_url;
  const localPath = join(
    process.cwd(),
    "public",
    "pdf",
    fm.topic,
    `${fm.slug}.pdf`,
  );
  if (existsSync(localPath)) {
    return `${SITE.url}/pdf/${fm.topic}/${fm.slug}.pdf`;
  }
  return null;
}

export function scholarMeta(fm: NoteFrontmatter): Record<string, string> {
  const meta: Record<string, string> = {
    citation_title: fm.title,
    citation_author: fm.author,
    citation_publication_date: fm.date_published,
    citation_journal_title: SITE.name,
    citation_language: "en",
    citation_abstract_html_url: fm.canonical_url,
    "DC.title": fm.title,
    "DC.creator": fm.author,
    "DC.date": fm.date_published,
    "DC.rights": fm.license,
    "DC.identifier": fm.canonical_url,
    "DC.language": "en",
    "DC.type": "Text.Article",
  };
  if (fm.doi) {
    meta.citation_doi = fm.doi;
    meta["DC.identifier.doi"] = fm.doi;
  }
  const pdfUrl = resolvePdfUrl(fm);
  if (pdfUrl) {
    meta.citation_pdf_url = pdfUrl;
  }
  meta["DC.subject"] = fm.keywords.join("; ");
  meta.citation_keywords = fm.keywords.join("; ");
  return meta;
}

export function buildNoteMetadata(fm: NoteFrontmatter): Metadata {
  const scholar = scholarMeta(fm);
  return {
    title: fm.title,
    description: fm.abstract,
    authors: [{ name: fm.author, url: `https://orcid.org/${fm.orcid}` }],
    keywords: fm.keywords,
    alternates: {
      canonical: fm.canonical_url,
    },
    openGraph: {
      title: fm.title,
      description: fm.abstract,
      url: fm.canonical_url,
      siteName: SITE.name,
      type: "article",
      publishedTime: fm.date_published,
      modifiedTime: fm.date_updated,
      authors: [fm.author],
      tags: fm.keywords,
    },
    twitter: {
      card: "summary",
      title: fm.title,
      description: fm.abstract,
    },
    other: scholar,
  };
}

export function buildSiteMetadata(): Metadata {
  return {
    metadataBase: new URL(SITE.url),
    title: {
      default: SITE.title,
      template: `%s — ${SITE.name}`,
    },
    description: SITE.description,
    authors: [
      { name: SITE.author.name, url: `https://orcid.org/${SITE.author.orcid}` },
    ],
    alternates: {
      canonical: SITE.url,
      types: {
        "application/rss+xml": [
          { url: `${SITE.url}/feed.xml`, title: `${SITE.name} feed` },
        ],
      },
    },
    openGraph: {
      title: SITE.title,
      description: SITE.description,
      url: SITE.url,
      siteName: SITE.name,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: SITE.title,
      description: SITE.description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
