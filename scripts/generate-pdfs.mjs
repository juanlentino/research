#!/usr/bin/env node
// Generate PDF snapshots of every published note.
//
// Rationale: the defensive-publication record is strongest when the
// *rendered* artifact — not just the MDX source — lives in git. A reader
// or patent examiner twenty years from now should be able to open a
// self-contained file that looks like what was published, even if the
// web site is gone.
//
// Invocation:
//   node scripts/generate-pdfs.mjs                                default prod URL
//   node scripts/generate-pdfs.mjs --base=http://localhost:3000   local dev
//
// Writes: public/pdf/<topic>/<slug>.pdf
//
// Design notes:
// - Runs via Puppeteer with headless Chromium. Navigates to the rendered
//   page (not a static HTML file) so the output reflects exactly what a
//   reader sees, including Tailwind styles and custom fonts.
// - Emulates `print` media so the optional @media print styles in
//   globals.css apply (none today, but leaves the hook open).
// - Strips the site header/footer from the PDF via a print-only body
//   class added before `page.pdf()` is called.
// - Runs sequentially, not in parallel, to keep memory footprint small
//   on CI runners.

import { readdirSync, readFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import puppeteer from "puppeteer";

const ROOT = process.cwd();
const CONTENT = join(ROOT, "content");
const OUT_ROOT = join(ROOT, "public", "pdf");

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  }),
);
const BASE = args.base || "https://research.juanlentino.com";

function collectPublishedNotes() {
  const notes = [];
  if (!existsSync(CONTENT)) return notes;
  const topics = readdirSync(CONTENT, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
    .map((d) => d.name);
  for (const topic of topics) {
    const dir = join(CONTENT, topic);
    const files = readdirSync(dir).filter(
      (f) => f.endsWith(".mdx") && !f.startsWith("_"),
    );
    for (const file of files) {
      const { data: fm } = matter(readFileSync(join(dir, file), "utf8"));
      if (fm.status && fm.status !== "published") continue;
      notes.push({ topic, slug: fm.slug, title: fm.title });
    }
  }
  return notes;
}

async function renderOne(browser, note) {
  const url = `${BASE}/${note.topic}/${note.slug}`;
  const page = await browser.newPage();
  try {
    await page.emulateMediaType("print");
    const res = await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: 30_000,
    });
    if (!res || !res.ok()) {
      throw new Error(`HTTP ${res ? res.status() : "none"} from ${url}`);
    }

    // Strip chrome: hide header + footer in print
    await page.addStyleTag({
      content: `
        header, footer { display: none !important; }
        main { padding-top: 0 !important; }
        article, .prose-body { max-width: none !important; }
      `,
    });

    const outDir = join(OUT_ROOT, note.topic);
    mkdirSync(outDir, { recursive: true });
    const outFile = join(outDir, `${note.slug}.pdf`);

    await page.pdf({
      path: outFile,
      format: "A4",
      margin: { top: "18mm", right: "18mm", bottom: "20mm", left: "18mm" },
      printBackground: true,
      preferCSSPageSize: false,
      displayHeaderFooter: false,
    });

    return outFile;
  } finally {
    await page.close();
  }
}

async function main() {
  const notes = collectPublishedNotes();
  if (notes.length === 0) {
    console.log("No published notes to render.");
    return;
  }
  console.log(`Rendering ${notes.length} note(s) from ${BASE}`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    for (const note of notes) {
      process.stdout.write(`  ${note.topic}/${note.slug}.pdf … `);
      try {
        const out = await renderOne(browser, note);
        console.log(`OK (${out.replace(ROOT + "/", "")})`);
      } catch (e) {
        console.log(`FAIL — ${e.message}`);
        process.exitCode = 1;
      }
    }
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error("fatal:", e);
  process.exit(1);
});
