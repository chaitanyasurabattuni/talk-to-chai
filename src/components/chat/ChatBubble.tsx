import { motion } from "framer-motion";
import type { Message } from "./useChat";
import { EvalDrawer } from "./EvalDrawer";

export function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
    >
      <div
        className={`max-w-[90%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "rounded-br-md bg-live-accent text-live-bg"
            : "rounded-bl-md bg-live-panel text-live-ink"
        } ${message.streaming && !message.content ? "min-w-[3rem]" : ""}`}
      >
        {message.content ? (
          <span className={message.streaming ? "caret" : ""}>{message.content}</span>
        ) : message.streaming ? (
          <span className="inline-flex gap-1 py-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-live-muted"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </span>
        ) : null}
      </div>

      {!isUser && <EvalDrawer message={message} />}
    </motion.div>
  );
}
