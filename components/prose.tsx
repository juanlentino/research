import type { ReactNode } from "react";

export function Prose({ children }: { children: ReactNode }) {
  return <article className="prose-body">{children}</article>;
}
