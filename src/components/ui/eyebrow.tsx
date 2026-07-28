import type { ReactNode } from "react";

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-4 flex items-center gap-2.5 text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-brand-strong">
      <span
        aria-hidden="true"
        className="h-px w-6 bg-brand-strong/50"
      />
      {children}
    </p>
  );
}
