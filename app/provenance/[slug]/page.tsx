import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import remarkSmartypants from "remark-smartypants";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

import { Container } from "@/components/container";
import { NoteHeader } from "@/components/note-header";
import { NoteFooter } from "@/components/note-footer";
import { Prose } from "@/components/prose";
import { ProvenancePanel } from "@/components/provenance-panel";
import { getNote, getNotesByTopic } from "@/lib/content";
import { buildNoteMetadata } from "@/lib/metadata";
import { getProvenance } from "@/lib/provenance";
import { useMDXComponents } from "@/mdx-components";

const TOPIC = "provenance";

export function generateStaticParams() {
  return getNotesByTopic(TOPIC).map((n) => ({ slug: n.frontmatter.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const note = getNote(TOPIC, slug);
  if (!note) return {};
  return buildNoteMetadata(note.frontmatter);
}

export default async function NotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const note = getNote(TOPIC, slug);
  if (!note) notFound();

  const provenance = getProvenance(TOPIC, slug);
  const components = useMDXComponents({});

  return (
    <Container>
      <div className="py-16">
        <NoteHeader fm={note.frontmatter} />
        <Prose>
          <MDXRemote
            source={note.body}
            components={components}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm, remarkSmartypants],
                rehypePlugins: [
                  rehypeSlug,
                  [
                    rehypeAutolinkHeadings,
                    { behavior: "wrap", properties: { className: "heading-anchor" } },
                  ],
                ],
              },
            }}
          />
        </Prose>
        {provenance ? <ProvenancePanel entry={provenance} /> : null}
        <NoteFooter fm={note.frontmatter} />
      </div>
    </Container>
  );
}
