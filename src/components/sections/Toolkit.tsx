import { Section, SectionLabel } from "../ui/Section";
import { Reveal } from "../ui/Reveal";
import { skills, education, certifications } from "../../data/resume";

export function Toolkit() {
  return (
    <Section id="toolkit" tone="paper" className="border-t border-paper-line">
      <SectionLabel>Toolkit</SectionLabel>
      <Reveal>
        <h2 className="text-3xl font-bold md:text-4xl">What I work with</h2>
      </Reveal>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {skills.map((group, i) => (
          <Reveal key={group.group} delay={0.05 * i}>
            <div className="rounded-2xl border border-paper-line bg-white/60 p-5">
              <h3 className="font-mono text-xs uppercase tracking-wider text-paper-muted">
                {group.group}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {group.skills.map((s) => (
                  <span
                    key={s}
                    className="rounded-lg bg-paper-ink/5 px-2.5 py-1 text-sm font-medium text-paper-ink/80"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1}>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="font-mono text-xs uppercase tracking-wider text-paper-muted">Education</h3>
            <div className="mt-3 space-y-3">
              {education.map((e) => (
                <div key={e.degree}>
                  <div className="font-semibold">{e.degree}</div>
                  <div className="text-sm text-paper-muted">
                    {e.school} · GPA {e.gpa} · {e.start}–{e.end}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-mono text-xs uppercase tracking-wider text-paper-muted">
              Certifications
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {certifications.map((c) => (
                <span
                  key={c}
                  className="rounded-lg bg-paper-ink/5 px-2.5 py-1 text-sm font-medium text-paper-ink/80"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
