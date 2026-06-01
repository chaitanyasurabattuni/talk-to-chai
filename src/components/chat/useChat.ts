import { useCallback, useRef, useState } from "react";
import { streamChat, fetchEval, type EvalResult } from "../../lib/api";
import type { PersonaId } from "../../data/personas";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** assistant only: streaming + eval lifecycle */
  streaming?: boolean;
  /** the user question this answer responded to (for the judge) */
  question?: string;
  eval?: EvalResult;
  evalState?: "idle" | "loading" | "done" | "error";
}

let idCounter = 0;
const nextId = () => `m${++idCounter}`;

export function useChat(persona: PersonaId) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const patch = useCallback((id: string, fields: Partial<Message>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...fields } : m)));
  }, []);

  const runEval = useCallback(
    async (assistantId: string, question: string, answer: string) => {
      patch(assistantId, { evalState: "loading" });
      try {
        const result = await fetchEval(persona, question, answer);
        patch(assistantId, { eval: result, evalState: "done" });
      } catch {
        patch(assistantId, { evalState: "error" });
      }
    },
    [persona, patch],
  );

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || busy) return;
      setError(null);

      const userMsg: Message = { id: nextId(), role: "user", content: trimmed };
      const assistantId = nextId();
      const assistantMsg: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        streaming: true,
        question: trimmed,
        evalState: "idle",
      };

      // Build the history payload from prior turns (before adding the new ones).
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setBusy(true);

      const controller = new AbortController();
      abortRef.current = controller;

      let acc = "";
      try {
        await streamChat(
          persona,
          [...history, { role: "user", content: trimmed }],
          (chunk) => {
            acc += chunk;
            patch(assistantId, { content: acc });
          },
          controller.signal,
        );
        patch(assistantId, { streaming: false });
        if (acc.trim()) void runEval(assistantId, trimmed, acc);
      } catch (err: any) {
        if (err?.name === "AbortError") {
          patch(assistantId, { streaming: false });
        } else {
          patch(assistantId, {
            streaming: false,
            content: acc || "Sorry — I hit a snag reaching the model. Try again in a moment.",
          });
          setError(err?.message ?? "Something went wrong.");
        }
      } finally {
        setBusy(false);
        abortRef.current = null;
      }
    },
    [busy, messages, persona, patch, runEval],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
  }, []);

  return { messages, busy, error, send, stop, reset };
}
