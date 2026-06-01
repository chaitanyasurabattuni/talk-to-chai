import { useEffect, useRef, useState } from "react";
import { SectionLabel } from "../ui/Section";
import { Reveal } from "../ui/Reveal";
import { usePersona } from "../../state/PersonaContext";
import { personas } from "../../data/personas";
import { profile } from "../../data/resume";
import { useChat } from "../chat/useChat";
import { ChatBubble } from "../chat/ChatBubble";

const OPENING = `👋 Hey — I'm an AI version of ${profile.name.split(" ")[0]}, grounded in his actual résumé (everything above). Ask me whatever's still unclear. I'll tell you when something's outside what I actually know.`;

export function TalkToMe() {
  const { effective } = usePersona();
  const { messages, busy, error, send, stop } = useChat(effective);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const chips = personas[effective].chips;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
    setInput("");
  };

  return (
    <section id="talk" className="w-full border-t border-live-line bg-live-bg text-live-ink">
      <div className="mx-auto max-w-3xl px-6 py-20 md:py-28">
        <SectionLabel tone="live">💬 Talk to me</SectionLabel>
        <Reveal>
          <h2 className="text-3xl font-bold md:text-4xl">
            Ask the agent. <span className="text-live-accent">It's live.</span>
          </h2>
          <p className="mt-2 max-w-xl text-live-muted">
            Real LLM, streaming in real time, grounded only in the résumé above — and it grades its
            own answers as it goes.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-8 overflow-hidden rounded-3xl border border-live-line bg-live-panel/40 shadow-2xl">
            {/* chat header */}
            <div className="flex items-center gap-3 border-b border-live-line px-5 py-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live-accent opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-live-accent" />
              </span>
              <span className="font-mono text-sm text-live-ink">chai-agent</span>
              <span className="font-mono text-[11px] text-live-muted">· {personas[effective].label} mode</span>
            </div>

            {/* messages */}
            <div ref={scrollRef} className="thin-scroll max-h-[28rem] min-h-[18rem] space-y-4 overflow-y-auto px-5 py-5">
              {/* opening message */}
              <div className="flex items-start">
                <div className="max-w-[90%] rounded-2xl rounded-bl-md bg-live-panel px-4 py-2.5 text-sm leading-relaxed text-live-ink">
                  {OPENING}
                </div>
              </div>

              {messages.map((m) => (
                <ChatBubble key={m.id} message={m} />
              ))}

              {messages.length === 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {chips.map((c) => (
                    <button
                      key={c}
                      onClick={() => send(c)}
                      className="rounded-full border border-live-line bg-live-bg/50 px-3 py-1.5 text-xs text-live-ink/80 transition-colors hover:border-live-accent/50 hover:text-live-accent"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* input */}
            <form onSubmit={onSubmit} className="border-t border-live-line p-3">
              {error && <p className="px-2 pb-2 text-xs text-red-400">{error}</p>}
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Ask ${profile.name.split(" ")[0]} anything…`}
                  className="flex-1 rounded-full border border-live-line bg-live-bg/60 px-4 py-2.5 text-sm text-live-ink placeholder:text-live-muted/60 focus:border-live-accent/60 focus:outline-none"
                  maxLength={4000}
                />
                {busy ? (
                  <button
                    type="button"
                    onClick={stop}
                    className="rounded-full bg-live-line px-4 py-2.5 text-sm font-semibold text-live-ink hover:bg-live-line/70"
                  >
                    Stop
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="rounded-full bg-live-accent px-5 py-2.5 text-sm font-semibold text-live-bg transition-opacity disabled:opacity-40"
                  >
                    Send
                  </button>
                )}
              </div>
            </form>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
