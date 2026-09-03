"use client";

import { useExperience } from "@/experience/provider";
import { EXPERIENCIAS, experienciaLabel } from "@/experience/roles";

/**
 * Seletor de experiência — mecanismo de validação de produto, NÃO de
 * autenticação (item 7/42 do spec). Deve deixar isso explícito na UI.
 */
export function ExperienceSwitcher() {
  const { experiencia, definirExperiencia } = useExperience();

  return (
    <div className="flex items-center gap-2">
      <span className="type-metadata hidden text-steel sm:inline">Experiência atual (dev)</span>
      <select
        aria-label="Selecionar experiência"
        value={experiencia}
        onChange={(e) => definirExperiencia(e.target.value as typeof experiencia)}
        className="type-body-small min-h-[2.5rem] rounded-md border border-mist bg-paper px-2 py-1 text-ink transition-colors duration-150 hover:border-steel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30"
      >
        {EXPERIENCIAS.map((exp) => (
          <option key={exp} value={exp}>
            {experienciaLabel[exp]}
          </option>
        ))}
      </select>
    </div>
  );
}
