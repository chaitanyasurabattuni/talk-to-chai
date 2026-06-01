import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionLabel } from "../ui/Section";
import { Reveal } from "../ui/Reveal";
import { fetchFit, type FitResult, type FitItem } from "../../lib/api";

const VERDICT_META: Record<FitResult["verdict"], { label: string; color: string; bg: string }> = {
  strong: { label: "Strong fit", color: "#5eead4", bg: "rgba(94,234,212,0.12)" },
  moderate: { label: "Moderate fit", color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
  stretch: { label: "A stretch", color: "#f87171", bg: "rgba(248,113,113,0.12)" },
};

function Bucket({
  title,
  items,
  accent,
  icon,
}: {
  title: string;
  items: FitItem[];
  accent: string;
  icon: string;
}) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-2xl border border-live-line bg-live-panel/50 p-5">
      <h4 className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider" style={{ color: accent }}>
        <span>{icon}</span> {title} <span className="text-live-muted">({items.length})</span>
      </h4>
      <ul className="mt-3 space-y-3">
        {items.map((it, i) => (
          <li key={i} className="text-sm">
            <div className="font-medium text-live-ink">{it.requirement}</div>
            <div className="mt-0.5 text-xs leading-relaxed text-live-muted">{it.evidence}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FitChecker() {
  const [jd, setJd] = useState("");
  const [result, setResult] = useState<FitResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (jd.trim().length < 30 || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await fetchFit(jd));
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="fit" className="w-full border-t border-live-line bg-live-bg text-live-ink">
      <div className="mx-auto max-w-3xl px-6 py-20 md:py-28">
        <SectionLabel tone="live">📋 Fit-checker</SectionLabel>
        <Reveal>
          <h2 className="text-3xl font-bold md:text-4xl">
            Paste a job description. <span className="text-live-accent">Get an honest read.</span>
          </h2>
          <p className="mt-3 max-w-xl text-live-muted">
            I'll assess myself against it — strong matches, partials, and the honest gaps. Grounded
            only in the résumé, scored as a fair analyst, not a salesperson.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-8">
            <textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste the job description here…"
              rows={6}
              maxLength={6000}
              className="thin-scroll w-full resize-y rounded-2xl border border-live-line bg-live-panel/40 p-4 text-sm text-live-ink placeholder:text-live-muted/60 focus:border-live-accent/60 focus:outline-none"
            />
            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={run}
                disabled={jd.trim().length < 30 || loading}
                className="rounded-full bg-live-accent px-6 py-2.5 text-sm font-semibold text-live-bg transition-opacity disabled:opacity-40"
              >
                {loading ? "Assessing…" : "Check the fit"}
              </button>
              <span className="font-mono text-[11px] text-live-muted">{jd.length}/6000</span>
            </div>
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
          </div>
        </Reveal>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 space-y-5"
            >
              <div
                className="flex items-center gap-3 rounded-2xl border px-5 py-4"
                style={{
                  borderColor: VERDICT_META[result.verdict].color + "55",
                  background: VERDICT_META[result.verdict].bg,
                }}
              >
                <span
                  className="rounded-full px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider"
                  style={{ color: VERDICT_META[result.verdict].color, border: `1px solid ${VERDICT_META[result.verdict].color}55` }}
                >
                  {VERDICT_META[result.verdict].label}
                </span>
                <p className="text-sm text-live-ink/90">{result.summary}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Bucket title="Strong" items={result.strong} accent="#5eead4" icon="✅" />
                <Bucket title="Partial" items={result.partial} accent="#fbbf24" icon="〰️" />
                <Bucket title="Gaps" items={result.gaps} accent="#f87171" icon="◯" />
              </div>

              <p className="text-center text-xs text-live-muted">
                Disagree with the read? <a href="#talk" className="text-live-accent underline-offset-4 hover:underline">Ask the agent ↑</a> to dig into any line.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
