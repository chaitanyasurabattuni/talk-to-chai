# Talk to Chai

A portfolio that you talk to instead of just read.

It opens like a normal résumé, then about halfway down it boots up into a live AI agent
that knows my background and answers questions about it. The catch: every answer it gives
is graded in real time by a second model, and you can watch the scores. If it ever makes
something up, the grade drops and you'll see it.

I build AI agents and the evaluation systems that keep them honest. This page is the
argument for that, built as the thing itself.

Live: _add your Vercel URL here_

## Running it locally

You need Node 18+ and a free Groq API key (grab one at https://console.groq.com/keys).

```bash
npm install
cp .env.example .env        # paste your GROQ_API_KEY into .env
npm run dev                 # http://localhost:5173
```

That's it. `npm run dev` serves the React app and the `/api` functions together through a
small Vite middleware, so there's no separate backend to start and no CLI to install.

```bash
npm run build               # type-check + production build
npm run preview             # serve the built static files (chat needs the deployed API)
```

## How it's put together

The whole thing hangs off one idea: `src/data/resume.ts` is the single source of truth.
The résumé sections you read and the knowledge the agent is given are built from the same
file, so they can't quietly disagree. If a fact isn't in there, the agent says so instead
of inventing one.

- `src/data/resume.ts` — the résumé as structured data, plus a few personal facts.
- `src/data/personas.ts` — turns that data into the agent's grounding, the per-persona
  system prompts (recruiter / engineer / curious), and the grading rubric.
- `api/chat.ts` — streams the agent's reply token by token.
- `api/judge.ts` — a separate, smaller model scores each answer on groundedness,
  relevance, and persona-fit, and returns strict JSON. This is the part I care about most.
- `api/fit.ts` — paste a job description and get an honest strong / partial / gap read.
- `api/_lib.ts` — a thin wrapper over an OpenAI-compatible API (Groq today), so pointing
  it at Claude or anyone else is a one-line change.

The agent is hard to talk out of character. There's a deterministic guard that refuses
obvious injection and jailbreak attempts before they ever reach the model, prompt-level
hardening behind that, and an output filter that blocks the system prompt from leaking.
The grader is the last line: anything that slips through still shows up as a bad score.

It runs entirely on free tiers, so it costs about nothing to host. When the primary model
hits a free-tier limit it automatically falls back to a smaller one rather than going dark.

## Configuration

Everything is driven by env vars (see `.env.example`):

| Variable | Default | What it's for |
| --- | --- | --- |
| `GROQ_API_KEY` | _required_ | Your Groq key |
| `GROQ_CHAT_MODEL` | `llama-3.3-70b-versatile` | The chat agent |
| `GROQ_JUDGE_MODEL` | `llama-3.1-8b-instant` | The grader |
| `GROQ_FALLBACK_MODEL` | `llama-3.1-8b-instant` | Used if the chat model is rate-limited |
| `GROQ_BASE_URL` | Groq's endpoint | Change it to use a different provider |

## Deploying

Built for Netlify. Connect the repo at app.netlify.com, add `GROQ_API_KEY` (and the model
overrides if you want them) under Site configuration → Environment variables, and deploy.
`netlify.toml` sets the build command and publish directory, and the functions in
`netlify/functions/` register the `/api/*` routes, so there's nothing else to wire up.

## Stack

React, TypeScript, Vite, Tailwind, and Framer Motion on the front end; small edge-style
functions and the Groq API on the back. No database — the résumé fits in the model's
context, so there's nothing to index.
