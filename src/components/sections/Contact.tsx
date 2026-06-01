import { SectionLabel } from "../ui/Section";
import { Reveal } from "../ui/Reveal";
import { profile } from "../../data/resume";

export function Contact() {
  return (
    <section id="contact" className="w-full border-t border-live-line bg-live-bg text-live-ink">
      <div className="mx-auto max-w-3xl px-6 py-20 md:py-28">
        <SectionLabel tone="live">Contact</SectionLabel>
        <Reveal>
          <h2 className="text-3xl font-bold md:text-4xl">Let's talk — for real this time.</h2>
          <p className="mt-3 max-w-xl text-live-muted">
            You've read the résumé and used an agent I built. If that resonated, I'd love to hear
            from you.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={`mailto:${profile.email}`}
              className="rounded-full bg-live-accent px-6 py-3 text-sm font-semibold text-live-bg transition-transform hover:-translate-y-0.5"
            >
              ✉ {profile.email}
            </a>
            <a
              href={profile.links.linkedin}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-live-line px-6 py-3 text-sm font-semibold text-live-ink transition-colors hover:border-live-accent/50"
            >
              LinkedIn ↗
            </a>
            <a
              href={profile.links.github}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-live-line px-6 py-3 text-sm font-semibold text-live-ink transition-colors hover:border-live-accent/50"
            >
              GitHub ↗
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="mt-8 text-sm text-live-muted">
            …or just keep chatting.{" "}
            <a href="#talk" className="text-live-accent underline-offset-4 hover:underline">
              Back to the agent ↑
            </a>
          </p>
        </Reveal>

        <footer className="mt-16 border-t border-live-line pt-6 text-xs text-live-muted">
          <p>
            Built by {profile.name} — Vite · React · TypeScript · Tailwind · Framer Motion, with a
            Groq-powered agent that grades itself. The medium is the message.
          </p>
        </footer>
      </div>
    </section>
  );
}
