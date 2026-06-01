import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { PersonaId } from "../data/personas";

interface PersonaState {
  /** null until the visitor picks (or we default after scroll). */
  persona: PersonaId | null;
  /** Effective persona used for content weighting + chat (defaults to "curious"). */
  effective: PersonaId;
  setPersona: (p: PersonaId) => void;
  hasChosen: boolean;
}

const Ctx = createContext<PersonaState | null>(null);

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [persona, setPersonaState] = useState<PersonaId | null>(null);

  const setPersona = useCallback((p: PersonaId) => setPersonaState(p), []);

  const value: PersonaState = {
    persona,
    effective: persona ?? "curious",
    setPersona,
    hasChosen: persona !== null,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePersona(): PersonaState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePersona must be used within PersonaProvider");
  return ctx;
}
