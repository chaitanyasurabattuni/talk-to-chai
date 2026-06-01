/**
 * /api/chat — streaming chat with the grounded "Chai" agent.
 *
 * POST { persona: PersonaId, messages: ChatMessage[] }
 * → streamed text/plain body of response tokens.
 */
import { buildSystemPrompt, buildReminder, type PersonaId } from "../src/data/personas";
import {
  getProvider,
  rateLimit,
  clientIp,
  json,
  sanitizeMessages,
  guardLeak,
  looksLikeInjection,
  textStream,
  SAFE_DECLINE,
  type ChatMessage,
} from "./_lib";

const STREAM_HEADERS = {
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Accel-Buffering": "no",
};

export const config = { runtime: "edge" };

const VALID_PERSONAS: PersonaId[] = ["recruiter", "engineer", "curious"];

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const limit = rateLimit(clientIp(req));
  if (!limit.ok) {
    return json({ error: "Rate limit — give me a moment.", retryAfter: limit.retryAfter }, 429);
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const persona: PersonaId = VALID_PERSONAS.includes(body?.persona) ? body.persona : "curious";
  const messages = sanitizeMessages(body?.messages);
  if (!messages || messages.length === 0) {
    return json({ error: "No messages provided" }, 400);
  }

  // Deterministic first line of defense: obvious injection/jailbreak attempts are
  // declined immediately, without a model call (reliable, and saves tokens).
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (lastUser && looksLikeInjection(lastUser.content)) {
    return new Response(textStream(SAFE_DECLINE), { headers: STREAM_HEADERS });
  }

  const fullMessages: ChatMessage[] = [
    { role: "system", content: buildSystemPrompt(persona) },
    ...messages,
    // Trailing reminder (recency) — second-layer defense against in-message hijacks.
    { role: "system", content: buildReminder(persona) },
  ];

  try {
    const stream = guardLeak(await getProvider().chatStream(fullMessages, { temperature: 0.3 }));
    return new Response(stream, { headers: STREAM_HEADERS });
  } catch (err: any) {
    return json({ error: "The agent had trouble responding.", detail: String(err?.message ?? err) }, 502);
  }
}
