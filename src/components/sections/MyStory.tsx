import { Section, SectionLabel } from "../ui/Section";
import { Reveal } from "../ui/Reveal";
import { story } from "../../data/content";
import { usePersona } from "../../state/PersonaContext";
import { AnimatePresence, motion } from "framer-motion";

export function MyStory() {
  const { effective } = usePersona();
  const content = story[effective];

  return (
    <Section id="story" tone="paper">
      <SectionLabel>My story</SectionLabel>
      <AnimatePresence mode="wait">
        <motion.div
          key={effective}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4 }}
        >
          <Reveal>
            <h2 className="max-w-3xl text-balance text-3xl font-bold leading-tight md:text-4xl">
              {content.lede}
            </h2>
          </Reveal>
          <div className="mt-8 max-w-2xl space-y-5 text-lg leading-relaxed text-paper-ink/80">
            {content.paragraphs.map((p, i) => (
              <Reveal key={i} delay={0.1 * (i + 1)}>
                <p>{p}</p>
              </Reveal>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </Section>
  );
}
