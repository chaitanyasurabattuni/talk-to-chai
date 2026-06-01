# Talk to Chai — Conversational Portfolio

> *"I build AI agents — and the systems that prove they actually work."*

A single-page **cinematic scroll portfolio** that begins as a polished résumé and
**boots up into a live, self-grading AI agent** as you scroll. By the bottom, a visitor
has *used* an agent — watched it grade its own answers against the résumé, and tested it
against their own job description.

The medium is the message: the page demonstrates GenAI + agent **evaluation** rather than
just describing it.

---

## Quick start

```bash
npm install

# 1. Get a free Groq API key → https://console.groq.com/keys
cp .env.example .env
#    then edit .env and set GROQ_API_KEY=gsk_...

npm run dev        # http://localhost:5173  (API routes served automatically)
```

`npm run dev` runs the frontend **and** the `/api/*` serverless handlers locally via a
small Vite middleware — no Vercel CLI needed. Just the key.

```bash
npm run build      # typecheck + production build to dist/
npm run preview    # preview the production build (static only — no API)
```

---

## How it works

| Layer | What it does |
|---|---|
| **Grounding** | [`src/data/resume.ts`](src/data/resume.ts) is the single source of truth. The portfolio sections **and** the agent both render from it, so they can never drift. |
| **Personas** | [`src/data/personas.ts`](src/data/personas.ts) builds the grounding dossier + per-persona system prompts, plus the LLM-as-judge rubric. |
| **Chat** | [`api/chat.ts`](api/chat.ts) streams a grounded answer from Groq (Llama 3.3 70B). |
| **Eval** | [`api/judge.ts`](api/judge.ts) — a second, smaller model scores each answer (groundedness / relevance / persona-fit) and returns strict JSON. The signature feature. |
| **Fit-checker** | [`api/fit.ts`](api/fit.ts) — paste a JD → structured strong / partial / gap assessment. |
| **Provider adapter** | [`api/_lib.ts`](api/_lib.ts) wraps an OpenAI-compatible API. Swapping Groq → Claude/OpenAI is a one-config change in `getProvider()`. |

Everything runs on **free tiers** — Groq's free API + a static deploy. ~$0/mo.

### Environment variables

| Var | Default | Notes |
|---|---|---|
| `GROQ_API_KEY` | — (required) | From https://console.groq.com/keys |
| `GROQ_CHAT_MODEL` | `llama-3.3-70b-versatile` | The streaming chat agent |
| `GROQ_JUDGE_MODEL` | `llama-3.1-8b-instant` | The faster LLM-as-judge |
| `GROQ_BASE_URL` | `https://api.groq.com/openai/v1` | Swap to point at another provider |

---

## Deploy (Vercel — recommended)

1. Push to GitHub, import the repo into Vercel (framework auto-detects as Vite).
2. Add `GROQ_API_KEY` (and optionally the model overrides) in **Project → Settings → Environment Variables**.
3. Deploy. `vercel.json` already wires the SPA rewrite and serves `/api/*` as edge functions.

**Cloudflare Pages** also works on the free tier — the API handlers are web-standard
`(Request) => Response`, but Pages Functions use a slightly different file convention
(`functions/api/chat.ts` exporting `onRequest`). Adapt the three handlers if you go that route.

---

## Architecture notes

- **Streaming**: `api/chat.ts` transforms Groq's OpenAI-style SSE into a plain UTF-8 token
  stream; the client reads it incrementally for the live-typing effect.
- **Honesty by design**: the system prompt forbids fabrication. Off-résumé questions get a
  clean refusal + an email nudge — and the judge scores a clean refusal as *highly grounded*.
- **Rate limiting**: best-effort in-memory per-IP limiter in `_lib.ts` (per-instance only —
  a speed-bump, not a hard guarantee). Input is capped at 4000 chars / 24 messages.

---

## TODO before going live

- [ ] **Rotate the Groq API key** before public deploy and set the fresh one as a
      Vercel/Cloudflare env var (the local `.env` key was shared in chat).
- [ ] Add a portrait image to the hero if desired.
- [ ] Set a custom domain (optional, ~$12/yr).
