import { motion } from "framer-motion";
import { profile } from "../../data/resume";
import { personas, personaOrder } from "../../data/personas";
import { usePersona } from "../../state/PersonaContext";

export function Hero() {
  const { persona, setPersona } = usePersona();

  return (
    <section
      id="hero"
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-paper-bg px-6 text-paper-ink"
    >
      {/* faint grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#1a1a1a 1px, transparent 1px), linear-gradient(90deg, #1a1a1a 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-5 font-mono text-xs uppercase tracking-[0.25em] text-paper-muted"
        >
          {profile.title} · {profile.subtitle}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="text-5xl font-extrabold tracking-tight md:text-7xl"
        >
          {profile.name}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-6 max-w-xl text-balance text-xl font-medium leading-snug text-paper-ink/80 md:text-2xl"
        >
          “{profile.tagline}”
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-12 w-full"
        >
          <p className="mb-4 text-sm font-medium text-paper-muted">Who's reading?</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {personaOrder.map((id) => {
              const p = personas[id];
              const active = persona === id;
              return (
                <button
                  key={id}
                  onClick={() => setPersona(id)}
                  className={`group flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all ${
                    active
                      ? "border-paper-ink bg-paper-ink text-paper-bg shadow-lg"
                      : "border-paper-line bg-white/60 text-paper-ink hover:border-paper-ink/40 hover:bg-white"
                  }`}
                  aria-pressed={active}
                >
                  <span className="text-base">{p.emoji}</span>
                  {p.label}
                </button>
              );
            })}
          </div>
          <motion.p
            key={persona ?? "none"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-xs text-paper-muted"
          >
            {persona
              ? personas[persona].blurb
              : "Pick one to tune the page — or just scroll. Either way, you'll meet an AI version of me at the bottom."}
          </motion.p>
        </motion.div>
      </div>

      {/* scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-paper-muted"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.2em]">Scroll</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
