#!/usr/bin/env node
// Validate the RSS 2.0 feeds this site will serve at build time.
//
// No maintained `feedvalidator` npm package exists (Ian Davis's 2013 gem
// was never ported), so we fall back to schema validation: parse XML,
// assert RSS 2.0 required channel + item elements, fail on any gap.
//
// The RSS generation logic below MIRRORS lib/rss.ts and lib/content.ts.
// Keeping these in sync is a manual discipline for now — any change to
// lib/rss.ts MUST be reflected here. Failing to mirror will drift the
// validator from the real feed.
//
// Runs at build time as part of `prebuild`, before `next build`. Because
// the feed generation depends only on content/*.mdx + lib/site.ts
// constants, we can render and validate without a running Next server.

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { XMLParser } from "fast-xml-parser";

const ROOT = process.cwd();
const CONTENT = join(ROOT, "content");

// Mirror of lib/site.ts — if SITE config changes, update here too.
const SITE = {
  name: "research.juanlentino.com",
  description:
    "Technical notes and defensive publications on music rights infrastructure, cryptographic provenance, and AI-era metadata systems.",
  url: "https://research.juanlentino.com",
  author: { name: "Juan Lentino", email: "juan@juanlentino.com" },
};

const TOPICS = {
  provenance: {
    slug: "provenance",
    title: "Provenance",
    description:
      "Cryptographic authentication, attribution, and chain-of-custody systems for audio and creative works.",
  },
};

function escapeXml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function collectNotes(topicFilter = null) {
  const notes = [];
  if (!existsSync(CONTENT)) return notes;
  const topics = readdirSync(CONTENT, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
    .map((d) => d.name);
  for (const topic of topics) {
    if (topicFilter && topic !== topicFilter) continue;
    const dir = join(CONTENT, topic);
    const files = readdirSync(dir).filter(
      (f) => f.endsWith(".mdx") && !f.startsWith("_"),
    );
    for (const file of files) {
      const { data: fm } = matter(readFileSync(join(dir, file), "utf8"));
      notes.push(fm);
    }
  }
  return notes.sort((a, b) => b.date_published.localeCompare(a.date_published));
}

// Mirror of lib/rss.ts:buildRss
function buildRss(notes, opts) {
  const items = notes
    .map((fm) => {
      const pub = new Date(fm.date_published).toUTCString();
      const kws = (fm.keywords || [])
        .map((k) => `<category>${escapeXml(k)}</category>`)
        .join("\n      ");
      const doi = fm.doi
        ? `<dc:identifier>${escapeXml(`doi:${fm.doi}`)}</dc:identifier>`
        : "";
      return `    <item>
      <title>${escapeXml(fm.title)}</title>
      <link>${escapeXml(fm.canonical_url)}</link>
      <guid isPermaLink="true">${escapeXml(fm.canonical_url)}</guid>
      <pubDate>${pub}</pubDate>
      <author>${escapeXml(SITE.author.email)} (${escapeXml(fm.author)})</author>
      <description>${escapeXml(fm.abstract)}</description>
      ${kws}
      ${doi}
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(opts.title)}</title>
    <link>${escapeXml(opts.homeUrl)}</link>
    <description>${escapeXml(opts.description)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(opts.selfUrl)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
}

const REQUIRED_CHANNEL = ["title", "link", "description"];
const REQUIRED_ITEM = ["title", "link", "guid", "pubDate", "description"];

function validateFeed(xml) {
  const errs = [];
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    parseTagValue: false,
  });

  let parsed;
  try {
    parsed = parser.parse(xml);
  } catch (e) {
    errs.push(`invalid XML: ${e.message}`);
    return errs;
  }

  const rss = parsed.rss;
  if (!rss) {
    errs.push("missing <rss> root element");
    return errs;
  }
  if (rss["@_version"] !== "2.0") {
    errs.push(`expected rss@version="2.0", got ${JSON.stringify(rss["@_version"])}`);
  }

  const channel = rss.channel;
  if (!channel) {
    errs.push("missing <channel>");
    return errs;
  }

  for (const field of REQUIRED_CHANNEL) {
    if (!channel[field]) errs.push(`channel missing <${field}>`);
  }

  const atomLink = channel["atom:link"];
  if (!atomLink || atomLink["@_rel"] !== "self") {
    errs.push('missing <atom:link rel="self"> for feed autodiscovery');
  }

  const items = Array.isArray(channel.item)
    ? channel.item
    : channel.item
      ? [channel.item]
      : [];

  for (let i = 0; i < items.length; i += 1) {
    const it = items[i];
    for (const field of REQUIRED_ITEM) {
      if (!it[field]) errs.push(`item[${i}] missing <${field}>`);
    }
    if (it.guid && !it.guid["@_isPermaLink"]) {
      errs.push(`item[${i}] <guid> missing isPermaLink attribute`);
    }
    if (it.pubDate) {
      const d = new Date(it.pubDate);
      if (Number.isNaN(d.getTime())) {
        errs.push(`item[${i}] <pubDate> is not RFC-822 parseable: ${it.pubDate}`);
      }
    }
  }

  return errs;
}

function buildGlobalFeed() {
  return buildRss(collectNotes(), {
    title: SITE.name,
    description: SITE.description,
    selfUrl: `${SITE.url}/feed.xml`,
    homeUrl: SITE.url,
  });
}

function buildTopicFeed(topicSlug) {
  const topic = TOPICS[topicSlug];
  return buildRss(collectNotes(topicSlug), {
    title: `${SITE.name} — ${topic.title}`,
    description: topic.description,
    selfUrl: `${SITE.url}/${topicSlug}/feed.xml`,
    homeUrl: `${SITE.url}/${topicSlug}`,
  });
}

function main() {
  const feeds = [
    { label: "/feed.xml (global)", build: buildGlobalFeed },
    { label: "/provenance/feed.xml (topic)", build: () => buildTopicFeed("provenance") },
  ];

  let totalErrs = 0;
  for (const feed of feeds) {
    process.stdout.write(`validating ${feed.label} … `);
    let xml;
    try {
      xml = feed.build();
    } catch (e) {
      console.log("FAIL");
      console.error(`  ✗ build error: ${e.message}`);
      totalErrs += 1;
      continue;
    }
    const errs = validateFeed(xml);
    if (errs.length) {
      console.log("FAIL");
      for (const e of errs) console.error(`  ✗ ${e}`);
      totalErrs += errs.length;
    } else {
      console.log("OK");
    }
  }
  if (totalErrs > 0) {
    console.error(`\n${totalErrs} feed validation error(s).`);
    process.exit(1);
  }
  console.log("\nAll feeds valid per RSS 2.0.");
}

main();
