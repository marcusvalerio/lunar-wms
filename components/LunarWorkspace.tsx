"use client";

import type { ReactNode } from "react";
import { useExperience } from "@/experience/provider";
import { experienciaLabel, experienciaPergunta } from "@/experience/roles";
import { ExperienceSwitcher } from "./ExperienceSwitcher";

/**
 * Shell para as experiências Operacional, Supervisão, Tático e Gestão.
 * Irmã do AdminShell — mesma família visual, contexto diferente.
 */
export function LunarWorkspace({ children }: { children: ReactNode }) {
  const { experiencia } = useExperience();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-mist px-6 py-4">
        <div className="flex items-baseline gap-3">
          <span className="type-h3 text-navy">LUNAR</span>
          <span className="type-metadata text-steel">{experienciaLabel[experiencia]}</span>
        </div>
        <ExperienceSwitcher />
      </header>

      <div className="border-b border-mist bg-stone px-6 py-3">
        <p className="type-body-small text-steel">{experienciaPergunta[experiencia]}</p>
      </div>

      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
