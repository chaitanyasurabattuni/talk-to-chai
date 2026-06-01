import { Section, SectionLabel } from "../ui/Section";
import { Reveal } from "../ui/Reveal";
import { experience } from "../../data/resume";
import { usePersona } from "../../state/PersonaContext";

export function Experience() {
  const { effective } = usePersona();
  // Engineers get every bullet; recruiters/curious get a tighter top-3 per role.
  const limit = effective === "engineer" ? Infinity : 3;

  return (
    <Section id="experience" tone="paper" className="border-t border-paper-line">
      <SectionLabel>Experience</SectionLabel>
      <Reveal>
        <h2 className="text-3xl font-bold md:text-4xl">Where I've worked</h2>
      </Reveal>

      <div className="mt-10 space-y-10">
        {experience.map((role, i) => (
          <Reveal key={role.id} delay={0.05 * i}>
            <div
              id={`role-${role.id}`}
              className="scroll-mt-24 border-l-2 border-paper-line pl-6 transition-colors hover:border-paper-ink/40"
            >
              <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline">
                <h3 className="text-xl font-bold">
                  {role.title} <span className="text-paper-muted">· {role.org}</span>
                </h3>
                <span className="whitespace-nowrap font-mono text-xs text-paper-muted">
                  {role.start} – {role.end}
                </span>
              </div>
              <div className="mt-1 text-sm text-paper-muted">{role.location}</div>
              <p className="mt-3 text-paper-ink/80">{role.summary}</p>
              <ul className="mt-3 space-y-2">
                {role.bullets.slice(0, limit).map((b, j) => (
                  <li key={j} className="flex gap-3 text-sm leading-relaxed text-paper-ink/75">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-paper-ink/40" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                {role.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-paper-line bg-white/60 px-2.5 py-1 font-mono text-[11px] text-paper-muted"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
