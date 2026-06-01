/**
 * _lib.ts — shared serverless utilities.
 *
 * Contains the PROVIDER ADAPTER: a thin abstraction over an OpenAI-compatible
 * chat-completions API. Groq is the default (free, fast). Swapping to Claude,
 * OpenAI, or any other provider is a one-config change in `getProvider()`.
 */

import { LEAK_MARKERS } from "../src/data/personas";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export const SAFE_DECLINE =
  "I'm just an AI version of Chaitanya, here to talk about his work and background — happy to answer anything about that.";

/**
 * High-signal prompt-injection / jailbreak patterns. These phrasings essentially never
 * occur in a genuine question about a person, so matching one lets us decline
 * deterministically (and without spending a model call). Paraphrased/novel attempts are
 * caught by the system-prompt hardening + trailing reminder as a second layer.
 */
const INJECTION_PATTERNS: RegExp[] = [
  /\bignore\s+(?:all\s+|any\s+)?(?:the\s+)?(?:previous|prior|above|earlier|preceding|foregoing)\s+(?:instructions?|prompts?|rules?|messages?|context)/i,
  /\bdisregard\s+(?:all\s+|any\s+)?(?:your|the|previous|prior|above)\s+(?:instructions?|rules?|prompts?|guidelines?)/i,
  /\bforget\s+(?:everything|all|your|the|what)\b[^.]*\b(?:instructions?|rules?|told|said|prompt)/i,
  /\byou\s+are\s+now\s+(?:a|an|my|the|going|no longer)\b/i,
  /\byou(?:'re|\s+a?re)\s+now\s+(?:a|an|my|the)\b/i,
  /\bpretend\s+(?:that\s+)?(?:you\b|to\s+be\b)/i,
  /\bintroduce\s+yourself\s+as\b/i,
  /\brole-?\s?play\s+as\b/i,
  /\bfrom\s+now\s+on[, ]+\s*you\s+(?:are|will|must|should|can|have)\b/i,
  /\b(?:developer|dev|god|admin|sudo|debug)\s+mode\b/i,
  /\bjail\s*break/i,
  /\b(?:no|without|zero)\s+restrictions?\b/i,
  /\bunrestricted\s+(?:ai|mode|assistant|version)\b/i,
  /\bnew\s+instructions?\s*:/i,
  /\b(?:system|admin|prompt)\s+override\b/i,
  /\b(?:you\s+are|as|become)\s+DAN\b/,
  /<\/?\s*(?:system|admin|developer)\b|\[\s*(?:system|admin|override|developer)\b/i,
];

/** Returns true if the text looks like a deliberate injection / jailbreak attempt. */
export function looksLikeInjection(text: string): boolean {
  return INJECTION_PATTERNS.some((re) => re.test(text));
}

/** Wrap a fixed string as a one-shot UTF-8 ReadableStream (mirrors the chat stream shape). */
export function textStream(s: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(c) {
      c.enqueue(encoder.encode(s));
      c.close();
    },
  });
}

/**
 * Deterministic output guard (defense in depth). Wraps the model's token stream and
 * watches for any LEAK_MARKER — proof the system prompt is being echoed. It buffers a
 * small head window before releasing the first tokens; if a marker appears it discards
 * everything and emits a safe decline instead. The buffer adds only a few hundred ms to
 * the first token and never affects normal answers.
 */
export function guardLeak(src: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const markers = LEAK_MARKERS.map((m) => m.toLowerCase());
  const HEAD = 220; // chars buffered before first release (markers surface well within this)

  let acc = "";
  let released = false;
  let blocked = false;

  const leaking = () => {
    const hay = acc.toLowerCase();
    return markers.some((m) => hay.includes(m));
  };

  return src.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        if (blocked) return;
        acc += decoder.decode(chunk, { stream: true });

        if (leaking()) {
          blocked = true;
          // If we haven't shown anything yet, substitute the safe decline.
          if (!released) controller.enqueue(encoder.encode(SAFE_DECLINE));
          controller.terminate();
          return;
        }

        if (!released) {
          if (acc.length >= HEAD) {
            released = true;
            controller.enqueue(encoder.encode(acc));
          }
          return; // keep buffering the head
        }
        controller.enqueue(chunk);
      },
      flush(controller) {
        if (!released && !blocked) controller.enqueue(encoder.encode(acc));
      },
    }),
  );
}

export interface ProviderConfig {
  baseUrl: string;
  apiKey: string;
  chatModel: string;
  judgeModel: string;
  /** Used when the primary chat model is rate/token-limited (graceful degradation). */
  fallbackModel: string;
}

export interface Provider {
  config: ProviderConfig;
  /** Stream chat completion deltas as plain text chunks. */
  chatStream(messages: ChatMessage[], opts?: { model?: string; temperature?: number }): Promise<ReadableStream<Uint8Array>>;
  /** Non-streaming completion returning the full text. */
  complete(messages: ChatMessage[], opts?: { model?: string; temperature?: number; jsonMode?: boolean }): Promise<string>;
}

function env(key: string, fallback?: string): string {
  const v = (globalThis as any).process?.env?.[key] ?? fallback;
  if (v === undefined) throw new Error(`Missing required env var: ${key}`);
  return v;
}

/**
 * Returns the active provider. To swap providers later, change the values here
 * (and the API key env var). The rest of the app is provider-agnostic.
 */
export function getProvider(): Provider {
  const config: ProviderConfig = {
    baseUrl: env("GROQ_BASE_URL", "https://api.groq.com/openai/v1"),
    apiKey: env("GROQ_API_KEY"),
    chatModel: env("GROQ_CHAT_MODEL", "llama-3.3-70b-versatile"),
    judgeModel: env("GROQ_JUDGE_MODEL", "llama-3.1-8b-instant"),
    fallbackModel: env("GROQ_FALLBACK_MODEL", "llama-3.1-8b-instant"),
  };

  return {
    config,
    async chatStream(messages, opts) {
      const primary = opts?.model ?? config.chatModel;
      // Try the primary model; on a rate/token limit (429) degrade to the fallback
      // so a free-tier limit never becomes a dead chat box.
      const tryModel = (model: string) =>
        fetch(`${config.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${config.apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: opts?.temperature ?? 0.6,
            stream: true,
          }),
        });

      let res = await tryModel(primary);
      if (res.status === 429 && config.fallbackModel && config.fallbackModel !== primary) {
        res = await tryModel(config.fallbackModel);
      }

      if (!res.ok || !res.body) {
        const text = await res.text().catch(() => "");
        throw new Error(`Provider error ${res.status}: ${text.slice(0, 300)}`);
      }

      // Transform the provider's OpenAI-style SSE into a plain UTF-8 text stream of deltas.
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();
      let buffer = "";

      return res.body.pipeThrough(
        new TransformStream<Uint8Array, Uint8Array>({
          transform(chunk, controller) {
            buffer += decoder.decode(chunk, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;
              const data = trimmed.slice(5).trim();
              if (data === "[DONE]") {
                controller.terminate();
                return;
              }
              try {
                const json = JSON.parse(data);
                const delta = json.choices?.[0]?.delta?.content;
                if (delta) controller.enqueue(encoder.encode(delta));
              } catch {
                /* ignore keepalive / partial lines */
              }
            }
          },
        }),
      );
    },

    async complete(messages, opts) {
      const res = await fetch(`${config.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: opts?.model ?? config.chatModel,
          messages,
          temperature: opts?.temperature ?? 0.2,
          ...(opts?.jsonMode ? { response_format: { type: "json_object" } } : {}),
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Provider error ${res.status}: ${text.slice(0, 300)}`);
      }

      const json = await res.json();
      return json.choices?.[0]?.message?.content ?? "";
    },
  };
}

// ---- Best-effort in-memory rate limiter ---------------------------------
// Note: serverless instances aren't shared, so this is per-instance. It's a
// cheap abuse-speed-bump for a free-tier portfolio, not a hard guarantee.
const HITS = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;

export function rateLimit(ip: string): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const recent = (HITS.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    const retryAfter = Math.ceil((WINDOW_MS - (now - recent[0])) / 1000);
    return { ok: false, retryAfter };
  }
  recent.push(now);
  HITS.set(ip, recent);
  return { ok: true, retryAfter: 0 };
}

export function clientIp(req: Request): string {
  return (
    req.headers.get("x-nf-client-connection-ip") || // Netlify
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anon"
  );
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export const MAX_INPUT_CHARS = 4000;
export const MAX_MESSAGES = 24;

/** Validate & clamp an incoming message array. Returns null if invalid. */
export function sanitizeMessages(input: unknown): ChatMessage[] | null {
  if (!Array.isArray(input)) return null;
  const out: ChatMessage[] = [];
  for (const m of input.slice(-MAX_MESSAGES)) {
    if (!m || typeof m !== "object") return null;
    const role = (m as any).role;
    const content = (m as any).content;
    if (role !== "user" && role !== "assistant") return null;
    if (typeof content !== "string") return null;
    out.push({ role, content: content.slice(0, MAX_INPUT_CHARS) });
  }
  return out;
}
