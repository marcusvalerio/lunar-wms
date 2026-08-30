"use client";

import { createContext, useContext, useState, useMemo, type ReactNode } from "react";
import { type Experiencia, shellDaExperiencia } from "./roles";

interface ExperienceContextValue {
  experiencia: Experiencia;
  definirExperiencia: (exp: Experiencia) => void;
  shell: "workspace" | "admin";
}

const ExperienceContext = createContext<ExperienceContextValue | null>(null);

const STORAGE_KEY = "lunar.experiencia.dev";

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [experiencia, setExperiencia] = useState<Experiencia>(() => {
    if (typeof window === "undefined") return "administracao";
    const salvo = window.sessionStorage.getItem(STORAGE_KEY);
    return (salvo as Experiencia) || "administracao";
  });

  const definirExperiencia = (exp: Experiencia) => {
    setExperiencia(exp);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(STORAGE_KEY, exp);
    }
  };

  const value = useMemo(
    () => ({
      experiencia,
      definirExperiencia,
      shell: shellDaExperiencia(experiencia),
    }),
    [experiencia]
  );

  return <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>;
}

export function useExperience() {
  const ctx = useContext(ExperienceContext);
  if (!ctx) {
    throw new Error("useExperience deve ser usado dentro de um ExperienceProvider");
  }
  return ctx;
}
