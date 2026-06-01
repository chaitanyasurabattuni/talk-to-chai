/** Client-side API helpers for the chat agent, the judge, and the fit-checker. */
import type { PersonaId } from "../data/personas";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface EvalResult {
  groundedness: number;
  relevance: number;
  personaFit: number;
  sources: string[];
  note: string;
}

export interface FitItem {
  requirement: string;
  evidence: string;
}

export interface FitResult {
  verdict: "strong" | "moderate" | "stretch";
  summary: string;
  strong: FitItem[];
  partial: FitItem[];
  gaps: FitItem[];
}

/** Stream a chat response token-by-token. Calls onToken for each chunk. */
export async function streamChat(
  persona: PersonaId,
  messages: ChatTurn[],
  onToken: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ persona, messages }),
    signal,
  });

  if (!res.ok || !res.body) {
    let msg = "The agent had trouble responding.";
    try {
      const j = await res.json();
      if (j?.error) msg = j.error;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onToken(decoder.decode(value, { stream: true }));
  }
}

export async function fetchEval(
  persona: PersonaId,
  question: string,
  answer: string,
  signal?: AbortSignal,
): Promise<EvalResult> {
  const res = await fetch("/api/judge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ persona, question, answer }),
    signal,
  });
  if (!res.ok) throw new Error((await safeError(res)) ?? "Eval failed.");
  return res.json();
}

export async function fetchFit(jd: string, signal?: AbortSignal): Promise<FitResult> {
  const res = await fetch("/api/fit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jd }),
    signal,
  });
  if (!res.ok) throw new Error((await safeError(res)) ?? "Fit check failed.");
  return res.json();
}

async function safeError(res: Response): Promise<string | null> {
  try {
    const j = await res.json();
    return j?.error ?? null;
  } catch {
    return null;
  }
}
