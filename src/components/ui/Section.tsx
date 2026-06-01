import type { ReactNode } from "react";

/** A full-width section band. `tone` switches between the print and live palettes. */
export function Section({
  id,
  children,
  tone = "paper",
  className = "",
}: {
  id?: string;
  children: ReactNode;
  tone?: "paper" | "live";
  className?: string;
}) {
  const toneClass =
    tone === "paper" ? "bg-paper-bg text-paper-ink" : "bg-live-bg text-live-ink";
  return (
    <section id={id} className={`w-full ${toneClass} ${className}`}>
      <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">{children}</div>
    </section>
  );
}

/** Small uppercase section label. */
export function SectionLabel({ children, tone = "paper" }: { children: ReactNode; tone?: "paper" | "live" }) {
  const color = tone === "paper" ? "text-paper-muted" : "text-live-accent";
  return (
    <div className={`mb-3 font-mono text-xs uppercase tracking-[0.2em] ${color}`}>{children}</div>
  );
}
