import { Section, SectionLabel } from "../ui/Section";
import { Reveal } from "../ui/Reveal";
import { highlights } from "../../data/resume";
import { usePersona } from "../../state/PersonaContext";

function scrollToRole(id: string) {
  document.getElementById(`role-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
}

export function Highlights() {
  const { effective } = usePersona();

  // Persona-weighted ordering — lead with what matters most to this reader.
  const ordered = [...highlights].sort((a, b) => b.weight[effective] - a.weight[effective]);

  return (
    <Section id="highlights" tone="paper" className="border-t border-paper-line">
      <SectionLabel>Highlights</SectionLabel>
      <Reveal>
        <h2 className="text-3xl font-bold md:text-4xl">A few things I'm proud of</h2>
        <p className="mt-2 text-paper-muted">Click any card to jump to where it happened.</p>
      </Reveal>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {ordered.map((h, i) => (
          <Reveal key={h.claim} delay={0.06 * i}>
            <button
              onClick={() => scrollToRole(h.sourceId)}
              className="group h-full w-full rounded-2xl border border-paper-line bg-white/70 p-6 text-left transition-all hover:-translate-y-0.5 hover:border-paper-ink/30 hover:shadow-lg"
            >
              <div className="text-3xl font-extrabold tracking-tight text-paper-ink md:text-4xl">
                {h.metric}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-paper-ink/70">{h.claim}</p>
              <span className="mt-4 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-paper-muted opacity-0 transition-opacity group-hover:opacity-100">
                see source →
              </span>
            </button>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
