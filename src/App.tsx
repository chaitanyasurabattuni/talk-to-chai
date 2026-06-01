import { PersonaProvider } from "./state/PersonaContext";
import { Hero } from "./components/sections/Hero";
import { MyStory } from "./components/sections/MyStory";
import { Highlights } from "./components/sections/Highlights";
import { Experience } from "./components/sections/Experience";
import { Toolkit } from "./components/sections/Toolkit";
import { BootupTransition } from "./components/sections/BootupTransition";
import { TalkToMe } from "./components/sections/TalkToMe";
import { EvalSpotlight } from "./components/sections/EvalSpotlight";
import { FitChecker } from "./components/sections/FitChecker";
import { Contact } from "./components/sections/Contact";

export default function App() {
  return (
    <PersonaProvider>
      <main className="min-h-screen w-full">
        {/* ░░ PORTFOLIO — get to know me ░░ */}
        <Hero />
        <MyStory />
        <Highlights />
        <Experience />
        <Toolkit />

        {/* ✦ boot-up: the page comes alive ✦ */}
        <BootupTransition />

        {/* ▓▓ INTERACTIVE AI LAYER ▓▓ */}
        <TalkToMe />
        <EvalSpotlight />
        <FitChecker />
        <Contact />
      </main>
    </PersonaProvider>
  );
}
