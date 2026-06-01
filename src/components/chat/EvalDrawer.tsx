import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { Message } from "./useChat";

function scrollToRole(label: string) {
  // Best-effort: map common source labels to role anchors.
  const map: Record<string, string> = {
    primehealth: "primehealth",
    "llm-judge": "primehealth",
    "llm-as-judge": "primehealth",
    lmes: "lmes",
    "gd research": "gdresearch",
    edgate: "edgate",
  };
  const key = label.toLowerCase().replace(/[^a-z0-9 -]/g, "").trim();
  const id = map[key];
  if (id) document.getElementById(`role-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function color(v: number): string {
  if (v >= 0.85) return "#5eead4"; // teal
  if (v >= 0.6) return "#fbbf24"; // amber
  return "#f87171"; // red
}

function Bar({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="grid grid-cols-[7rem_1fr_2.5rem] items-center gap-3" title={hint}>
      <span className="font-mono text-[11px] text-live-muted">{label}</span>
      <div className="h-2 overflow-hidden rounded-full bg-live-line">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color(value) }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.round(value * 100)}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>
      <span className="text-right font-mono text-[11px] tabular-nums" style={{ color: color(value) }}>
        {value.toFixed(2)}
      </span>
    </div>
  );
}

export function EvalDrawer({ message }: { message: Message }) {
  const [open, setOpen] = useState(true);
  const state = message.evalState ?? "idle";

  if (state === "idle") return null;

  return (
    <div className="mt-2 w-full max-w-[90%] rounded-xl border border-live-accent2/30 bg-live-panel/60 text-xs">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
      >
        <span className="flex items-center gap-2 font-mono uppercase tracking-wider text-live-accent2">
          ⚖️ eval
          {state === "loading" && <span className="text-live-muted">grading…</span>}
          {state === "error" && <span className="text-red-400">unavailable</span>}
        </span>
        <span className="text-live-muted">{open ? "▾" : "▸"}</span>
      </button>

      <AnimatePresence initial={false}>
        {open && state === "done" && message.eval && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 px-3 pb-3">
              <Bar label="groundedness" value={message.eval.groundedness} hint="Every claim backed by the résumé?" />
              <Bar label="relevance" value={message.eval.relevance} hint="Answered what was asked?" />
              <Bar label="persona-fit" value={message.eval.personaFit} hint="Right depth for the persona?" />

              {message.eval.note && (
                <p className="pt-1 text-[11px] italic leading-relaxed text-live-muted">
                  “{message.eval.note}”
                </p>
              )}

              {message.eval.sources.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="font-mono text-[10px] uppercase text-live-muted">sources →</span>
                  {message.eval.sources.map((s) => (
                    <button
                      key={s}
                      onClick={() => scrollToRole(s)}
                      className="rounded-md border border-live-line bg-live-bg/50 px-2 py-0.5 font-mono text-[10px] text-live-accent hover:border-live-accent/50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {open && state === "loading" && (
          <div className="px-3 pb-3">
            <div className="space-y-2">
              {["groundedness", "relevance", "persona-fit"].map((l) => (
                <div key={l} className="grid grid-cols-[7rem_1fr_2.5rem] items-center gap-3">
                  <span className="font-mono text-[11px] text-live-muted">{l}</span>
                  <div className="h-2 animate-pulse rounded-full bg-live-line" />
                  <span />
                </div>
              ))}
            </div>
          </div>
        )}

        {open && state === "error" && (
          <p className="px-3 pb-3 text-[11px] text-live-muted">
            The judge call didn't come back — the answer above is unchanged.
          </p>
        )}
      </AnimatePresence>
    </div>
  );
}
