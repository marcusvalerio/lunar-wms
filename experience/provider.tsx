"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import { type Experiencia, shellDaExperiencia } from "./roles";

/**
 * Loja externa mínima (sessionStorage) exposta via useSyncExternalStore —
 * é a forma correta do React de ler um valor só disponível no cliente
 * sem causar mismatch de hidratação e sem precisar de setState em efeito.
 */
const STORAGE_KEY = "lunar.experiencia.dev";
const ouvintes = new Set<() => void>();

function obterInstantaneo(): Experiencia {
  return (window.sessionStorage.getItem(STORAGE_KEY) as Experiencia) || "administracao";
}

function obterInstantaneoServidor(): Experiencia {
  return "administracao";
}

function inscrever(callback: () => void) {
  ouvintes.add(callback);
  return () => ouvintes.delete(callback);
}

function persistirEexperiencia(exp: Experiencia) {
  window.sessionStorage.setItem(STORAGE_KEY, exp);
  ouvintes.forEach((cb) => cb());
}

interface ExperienceContextValue {
  experiencia: Experiencia;
  definirExperiencia: (exp: Experiencia) => void;
  shell: "workspace" | "admin";
}

const ExperienceContext = createContext<ExperienceContextValue | null>(null);

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const experiencia = useSyncExternalStore(inscrever, obterInstantaneo, obterInstantaneoServidor);

  const value: ExperienceContextValue = {
    experiencia,
    definirExperiencia: persistirEexperiencia,
    shell: shellDaExperiencia(experiencia),
  };

  return <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>;
}

export function useExperience() {
  const ctx = useContext(ExperienceContext);
  if (!ctx) {
    throw new Error("useExperience deve ser usado dentro de um ExperienceProvider");
  }
  return ctx;
}
