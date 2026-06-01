# Talk to Chai — Conversational Portfolio

**Owner:** Chaitanya Surabattuni · ML/AI Engineer (GenAI & Agentic AI Evaluation)
**Tagline:** *"I build AI agents — and the systems that prove they actually work."*

A single-page **cinematic scroll portfolio** that begins as a polished résumé and
**boots up into a live, self-grading AI agent** as you scroll. The journey itself is
the proof of skill: by the bottom, a recruiter has *used* an agent Chaitanya built,
watched it grade its own answers, and tested it against their own job description.

> Theme: the medium is the message. The page demonstrates GenAI + agent **evaluation**
> rather than just describing it.

---

## Core decisions (locked)

| Decision | Choice |
|---|---|
| Format | Single-page **vertical scroll journey** (scroll-only, no shortcut buttons) |
| Top of page | The **portfolio** (get to know me) |
| Lower page | **Interactive AI layer** unlocks as you scroll |
| Engine | **Real LLM agent**, **$0/mo** — Groq free tier (Llama 3.3 70B) |
| Grounding | Résumé fits in-context → **no vector DB**, no paid embeddings |
| Provider design | Thin **provider adapter** so Claude/others drop in later (1-line swap) |
| Audience | **Both** recruiters & engineers — via a persona toggle |
| Persona toggle | **In the hero**; personalizes the *entire* scroll + the chat voice |
| Voice | **Honest-but-flattering** — truthful, best-light framing, clean refusals |
| Chat aesthetic | **Clean iMessage / chat-app** bubbles, streaming tokens |
| Scroll feel | **Cinematic** — portfolio visibly "comes alive" / agent "boots up" |
| Eval drawer | **In v1** — LLM-as-judge scores each answer (the differentiator) |
| Fit-checker | **In v1** — paste a JD → structured strong/partial/gap match |

---

## The scroll journey (top → bottom)

```
░░░░░░░░░░ PORTFOLIO (know me) ░░░░░░░░░░
1. HERO        Name · title · eval-focused line · portrait · persona picker · scroll cue
2. MY STORY    First-person arc: ECE → data science → GenAI → AI-agent evaluation
3. HIGHLIGHTS  Metric cards: 71→93% routing · 90% cost cut · 15x throughput · caught silent regression
4. EXPERIENCE  Skimmable timeline of roles
5. TOOLKIT     Grouped skills

        ✦ BOOT-UP TRANSITION ✦
   palette shifts to "live" tone; "initializing agent… grounding on résumé… ready"

▓▓▓▓▓▓▓ INTERACTIVE AI LAYER ▓▓▓▓▓▓▓
6. 💬 TALK TO ME   Live Groq agent, grounded in everything above. Persona preset.
                   Streaming, iMessage-clean, honest, clean refusals.
7. ⚖️ IT GRADES ITSELF   Eval drawer spotlight — LLM-as-judge: groundedness / relevance / persona-fit
8. 📋 FIT-CHECKER   Paste a JD → structured strong / partial / gap match
9. CONTACT     Email, links, "or just keep chatting ↑"
```

Sections fade/rise on entry. Portfolio half feels print-clean; AI half feels alive.

---

## Persona gate (hero) — personalizes the whole scroll

On load the hero asks **"Who's reading?" → 👔 Recruiter · 🛠️ Engineer · 👀 Curious.**
One tap re-weights everything below:

- **Recruiter** → highlights lead with impact/fit; tight story; fast path to contact
- **Engineer** → highlights lead with architecture + eval depth; more technical story
- **Curious** → story-forward; plain language

It also sets the chat agent's system-prompt persona. If ignored, content defaults to a
balanced blend — never a hard gate (pure scroll must not be blocked).

---

## The eval drawer (signature feature)

After each answer, a **second lightweight Groq call** acts as an **LLM-as-judge**
(Chaitanya's actual PrimeHealth pattern), scoring the answer vs. the résumé context:

```
┌─ this answer ───────────── ⚖️ eval ─┐
│ Groundedness   ████████░░  0.91      │  every claim backed by résumé?
│ Relevance      █████████░  0.95      │  answered what was asked?
│ Persona-fit    ████████░░  0.88      │  right depth for the persona?
│ Sources    →  PrimeHealth · LLM-judge│  clickable → scrolls to that role
└──────────────────────────────────────┘
```

- **Genuine, not theater** — real judge model + rubric + per-field scores.
- **Falsifiable** — when groundedness dips, the drawer shows it. The honesty is the flex.
- **Free** — one extra small/fast call per turn; cache identical questions.
- Includes a small **"How I built this eval"** modal explaining the rubric.

---

## The fit-checker (headliner)

A "📋 Paste a job description" mode → structured output: **strong fits / partial / gaps**,
honestly assessed. Demonstrates structured-output design + judgment. Reuses the eval UI.

---

## Conversation design

**Opening message:**
> 👋 Hey — I'm an AI version of Chaitanya, grounded in his actual résumé. Read a bit
> above, then ask me whatever's still unclear. *(I'll tell you when something's outside
> what I actually know.)*

**Suggested chips, per persona:**
- 👔 Recruiter → "Is he a fit for an LLM eval role?" · "Years of experience?" · "Location / authorization?" · "Biggest impact at PrimeHealth?"
- 🛠️ Engineer → "Walk me through the silent-regression bug" · "How does the LLM-as-judge rubric work?" · "RAG architecture you've shipped?" · "How'd you cut serving costs 90%?"
- 👀 Curious → "What's your story?" · "Why AI?" · "What are you proudest of?" · "What's next?"

**Fallback / refusal (trust-builder):** off-résumé questions → say so plainly, offer
email, **never fabricate**. This behavior *is* the career thesis.

---

## Tech stack (all free — $0/mo)

- **Frontend:** Vite + React + TypeScript + Tailwind CSS + Framer Motion (cinematic scroll)
- **Backend:** one serverless function `/api/chat` (streaming) — Groq API key server-side,
  per-IP rate limit + input cap, **provider adapter** abstraction
- **Grounding:** structured `resume.ts` (résumé as data) + per-persona system prompts
- **LLM:** Groq free tier — Llama 3.3 70B (fast streaming); judge call on a small/fast model
- **Deploy:** Vercel **or** Cloudflare Pages (free tier)
- Optional: ~$12/yr custom domain

---

## Three "wow" moments

1. **First token in <1s** (Groq) — feels alive, not a form.
2. **The eval drawer** — "wait, it's grading itself?"
3. **A clean refusal** — proves the grounding is real and the agent knows its limits.

---

## Build order (proposed)

1. Scaffold (Vite + React + TS + Tailwind + Framer Motion) + repo
2. `resume.ts` grounding data + per-persona system prompts
3. Static portfolio sections (1–5) + persona gate + cinematic scroll
4. `/api/chat` serverless function w/ Groq adapter + rate limiting
5. Chat UI (streaming, bubbles, chips) — section 6
6. Eval drawer (judge call + UI) — section 7
7. Fit-checker — section 8
8. Contact + polish + deploy

---

*Status: concept locked. Next: scaffold the project, or draft all copy first.*
