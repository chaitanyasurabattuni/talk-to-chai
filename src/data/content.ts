/**
 * content.ts — persona-weighted on-page copy.
 *
 * The persona toggle in the hero re-weights what the visitor reads here.
 * Everything is grounded in resume.ts; this is just framing/emphasis.
 */
import type { PersonaId } from "./personas";

export interface StoryContent {
  lede: string;
  paragraphs: string[];
}

export const story: Record<PersonaId, StoryContent> = {
  recruiter: {
    lede: "Three years turning GenAI demos into systems you can trust in production.",
    paragraphs: [
      "I'm an ML/AI engineer focused on the part most teams skip: proving the agent actually works. At PrimeHealth I build the evaluation infrastructure behind a multi-channel AI health coach — ground-truth datasets, per-field accuracy metrics, and an LLM-as-judge framework that pushed domain routing from 71% to 93%.",
      "Before that I shipped production LLM voice and chat agents at LMES and cut model-serving costs by up to 90%. The through-line: I care about impact you can measure, and I'll tell you honestly where the gaps are.",
    ],
  },
  engineer: {
    lede: "From ECE → data science → GenAI → the evaluation systems that keep agents honest.",
    paragraphs: [
      "I started in electronics and communication engineering, moved into data science, then into building GenAI systems — and kept gravitating toward the hardest, least-glamorous part: evaluation. Anyone can demo an agent; far fewer can tell you, with numbers, whether it regressed overnight.",
      "At PrimeHealth I design ground-truth datasets across 21 intent domains, run an LLM-as-judge scoring on a 0–100 rubric across 128 synthesized personas, and keep CI honest — including the time I caught a silent regression where every classifier assertion was passing vacuously. Earlier, at LMES, I built LangGraph agents and RAG pipelines and squeezed serving costs down ~90% with hybrid execution and Redis semantic caching.",
    ],
  },
  curious: {
    lede: "I build AI agents — and I'm a little obsessed with proving they actually work.",
    paragraphs: [
      "My path wasn't a straight line: electronics engineering in India, then data science, then a master's in AI in Texas, and now building AI in the Bay Area. Somewhere along the way I realized the interesting question isn't 'can the AI answer?' — it's 'how do we know it answered well?'",
      "So that's what I do now: I build the AI agents, and I build the systems that grade them. This whole page is an example — scroll down and you'll meet an AI version of me, and watch it grade its own answers in real time.",
    ],
  },
};

export const bootupLines = [
  "initializing agent…",
  "loading grounding dossier (résumé)…",
  "wiring LLM-as-judge…",
  "ready.",
];
