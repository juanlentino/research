import type { ReactNode } from "react";

export function Container({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[44rem] px-6 md:px-8">
      {children}
    </div>
  );
}
