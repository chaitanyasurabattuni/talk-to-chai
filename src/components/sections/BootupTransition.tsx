import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { bootupLines } from "../../data/content";

export function BootupTransition() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (shown >= bootupLines.length) return;
    const t = setTimeout(() => setShown((s) => s + 1), shown === 0 ? 300 : 650);
    return () => clearTimeout(t);
  }, [inView, shown]);

  const done = shown >= bootupLines.length;

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden bg-gradient-to-b from-paper-bg to-live-bg py-28"
    >
      <div className="mx-auto max-w-2xl px-6">
        <div className="rounded-2xl border border-live-line bg-live-panel/80 p-6 font-mono text-sm shadow-2xl backdrop-blur">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-400/70" />
            <span className="h-3 w-3 rounded-full bg-yellow-400/70" />
            <span className="h-3 w-3 rounded-full bg-green-400/70" />
            <span className="ml-2 text-xs text-live-muted">chai-agent — boot</span>
          </div>
          <div className="space-y-1.5">
            {bootupLines.map((line, i) => {
              if (i >= shown) return null;
              const isLast = i === bootupLines.length - 1;
              return (
                <motion.div
                  key={line}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center gap-2 ${isLast ? "text-live-accent" : "text-live-muted"}`}
                >
                  <span className="text-live-accent/60">›</span>
                  <span>{line}</span>
                  {isLast && <span className="text-live-accent">✓</span>}
                </motion.div>
              );
            })}
            {!done && (
              <div className="flex items-center gap-2 text-live-muted">
                <span className="text-live-accent/60">›</span>
                <span className="inline-block h-3.5 w-2 animate-blink bg-live-accent" />
              </div>
            )}
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: done ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          className="mt-6 text-center text-sm text-live-muted"
        >
          You've read the résumé. Now ask it anything. ↓
        </motion.p>
      </div>
    </section>
  );
}
