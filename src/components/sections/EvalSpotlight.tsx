import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionLabel } from "../ui/Section";
import { Reveal } from "../ui/Reveal";

const RUBRIC = [
  {
    name: "Groundedness",
    q: "Is every claim backed by the résumé?",
    detail: "The judge re-reads the same grounding dossier the agent had, then checks each factual claim against it. An honest refusal of an off-résumé question scores high — refusing to fabricate is the correct behavior.",
  },
  {
    name: "Relevance",
    q: "Did it answer what was asked?",
    detail: "A well-grounded answer to the wrong question still fails. Relevance keeps the agent from dodging into safe-but-useless territory.",
  },
  {
    name: "Persona-fit",
    q: "Right depth for the reader?",
    detail: "Recruiter answers should lead with impact; engineer answers should go deep; curious answers should stay plain. The judge knows which persona is active.",
  },
];

export function EvalSpotlight() {
  const [modal, setModal] = useState(false);

  return (
    <section id="eval" className="w-full border-t border-live-line bg-live-bg text-live-ink">
      <div className="mx-auto max-w-3xl px-6 py-20 md:py-28">
        <SectionLabel tone="live">⚖️ It grades itself</SectionLabel>
        <Reveal>
          <h2 className="text-3xl font-bold md:text-4xl">
            Every answer gets a <span className="text-live-accent2">second opinion</span>.
          </h2>
          <p className="mt-3 max-w-xl text-live-muted">
            After each reply, a separate, smaller model acts as an{" "}
            <strong className="text-live-ink">LLM-as-judge</strong> — the same pattern I built at
            PrimeHealth — and scores the answer against the résumé. When groundedness dips, the
            drawer shows it. The honesty is the point.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {RUBRIC.map((r, i) => (
            <Reveal key={r.name} delay={0.08 * i}>
              <div className="h-full rounded-2xl border border-live-accent2/25 bg-live-panel/50 p-5">
                <div className="font-mono text-xs uppercase tracking-wider text-live-accent2">
                  {r.name}
                </div>
                <p className="mt-2 text-sm font-medium text-live-ink">{r.q}</p>
                <p className="mt-2 text-xs leading-relaxed text-live-muted">{r.detail}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={() => setModal(true)}
              className="rounded-full border border-live-accent2/40 px-5 py-2.5 text-sm font-semibold text-live-accent2 transition-colors hover:bg-live-accent2/10"
            >
              How I built this eval →
            </button>
            <a
              href="#talk"
              className="text-sm text-live-muted underline-offset-4 hover:text-live-ink hover:underline"
            >
              ↑ scroll up and watch it grade a real answer
            </a>
          </div>
        </Reveal>
      </div>

      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="thin-scroll max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-live-line bg-live-panel p-6 text-sm leading-relaxed text-live-ink shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold">How the eval works</h3>
                <button onClick={() => setModal(false)} className="text-live-muted hover:text-live-ink">
                  ✕
                </button>
              </div>
              <ol className="list-decimal space-y-3 pl-5 text-live-muted">
                <li>
                  The chat agent answers using a <strong className="text-live-ink">grounding dossier</strong>{" "}
                  built directly from my résumé — the same data that renders the portfolio above, so
                  the agent and the page can never drift.
                </li>
                <li>
                  Each answer triggers a <strong className="text-live-ink">second model call</strong>{" "}
                  (a smaller, faster model) prompted as an LLM-as-judge. It gets the dossier, the
                  question, the answer, and the active persona.
                </li>
                <li>
                  It returns <strong className="text-live-ink">strict JSON</strong>: three 0–1 scores
                  (groundedness, relevance, persona-fit), the sources it drew on, and a one-line note.
                  Temperature 0 for repeatability.
                </li>
                <li>
                  The drawer renders those scores live. A clean refusal of an off-résumé question is
                  scored as <em>highly</em> grounded — refusing to fabricate is correct behavior, not
                  a failure.
                </li>
              </ol>
              <p className="mt-4 rounded-lg border border-live-line bg-live-bg/50 p-3 text-xs text-live-muted">
                This mirrors what I do at PrimeHealth: ground-truth datasets, structured rubrics, and
                an LLM-as-judge that scaled qualitative benchmarking to ~15× manual throughput.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
