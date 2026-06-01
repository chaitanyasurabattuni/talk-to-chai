/**
 * /api/judge — the LLM-as-judge eval call (the signature feature).
 *
 * POST { persona, question, answer }
 * → { groundedness, relevance, personaFit, sources[], note }
 *
 * Uses a smaller/faster model than the chat agent. This is a genuine second
 * model call scoring the answer against the same grounding the agent used —
 * the same LLM-as-judge pattern Chaitanya built at PrimeHealth.
 */
import { buildJudgePrompt, buildGrounding, personas, type PersonaId } from "../src/data/personas";
import { getProvider, rateLimit, clientIp, json, MAX_INPUT_CHARS } from "./_lib";

export const config = { runtime: "edge" };

const VALID_PERSONAS: PersonaId[] = ["recruiter", "engineer", "curious"];

export interface EvalResult {
  groundedness: number;
  relevance: number;
  personaFit: number;
  sources: string[];
  note: string;
}

function clamp01(n: unknown): number {
  const v = typeof n === "number" ? n : Number(n);
  if (!isFinite(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const limit = rateLimit(clientIp(req));
  if (!limit.ok) return json({ error: "Rate limit", retryAfter: limit.retryAfter }, 429);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const persona: PersonaId = VALID_PERSONAS.includes(body?.persona) ? body.persona : "curious";
  const question = String(body?.question ?? "").slice(0, MAX_INPUT_CHARS);
  const answer = String(body?.answer ?? "").slice(0, MAX_INPUT_CHARS);
  if (!question || !answer) return json({ error: "Missing question or answer" }, 400);

  const provider = getProvider();
  const userBlock = `PERSONA: ${personas[persona].label}

GROUNDING DOSSIER (the only allowed facts):
${buildGrounding()}

USER QUESTION:
${question}

ASSISTANT ANSWER TO EVALUATE:
${answer}

Return the strict JSON object now.`;

  try {
    const raw = await provider.complete(
      [
        { role: "system", content: buildJudgePrompt() },
        { role: "user", content: userBlock },
      ],
      { model: provider.config.judgeModel, temperature: 0, jsonMode: true },
    );

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Best-effort extraction if the model wrapped JSON in prose.
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : {};
    }

    const result: EvalResult = {
      groundedness: clamp01(parsed.groundedness),
      relevance: clamp01(parsed.relevance),
      personaFit: clamp01(parsed.personaFit),
      sources: Array.isArray(parsed.sources) ? parsed.sources.slice(0, 6).map(String) : [],
      note: typeof parsed.note === "string" ? parsed.note.slice(0, 200) : "",
    };

    return json(result);
  } catch (err: any) {
    return json({ error: "Judge call failed.", detail: String(err?.message ?? err) }, 502);
  }
}
