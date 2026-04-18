import Link from "next/link";
import { Container } from "./container";
import { SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-[var(--rule)] py-10">
      <Container>
        <div className="flex flex-col gap-3 text-xs text-[var(--fg-subtle)] md:flex-row md:items-center md:justify-between">
          <div>
            © {new Date().getFullYear()} {SITE.author.name}. Content licensed{" "}
            <a href={SITE.license.url} rel="license">
              {SITE.license.id}
            </a>
            . ORCID{" "}
            <a href={`https://orcid.org/${SITE.author.orcid}`}>
              {SITE.author.orcid}
            </a>
            .
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/feed.xml">RSS</Link>
            <Link href="/sitemap.xml">Sitemap</Link>
            <a href={SITE.repo}>Source</a>
          </nav>
        </div>
      </Container>
    </footer>
  );
}
