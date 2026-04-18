import Link from "next/link";
import { Container } from "./container";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--rule)]">
      <Container>
        <div className="flex h-14 items-center justify-between">
          <Link
            href="/"
            className="no-underline text-sm tracking-tight text-[var(--fg)] hover:no-underline"
          >
            <span className="font-serif italic">research</span>
            <span className="text-[var(--fg-subtle)]">.juanlentino.com</span>
          </Link>
          <nav className="flex items-center gap-5 text-sm text-[var(--fg-muted)]">
            <Link href="/provenance/" className="no-underline hover:text-[var(--fg)]">
              Provenance
            </Link>
            <Link href="/about/" className="no-underline hover:text-[var(--fg)]">
              About
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </Container>
    </header>
  );
}
