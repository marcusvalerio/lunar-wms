"use client";

import { useExperience } from "@/experience/provider";
import { AdminShell } from "@/components/AdminShell";
import { LunarWorkspace } from "@/components/LunarWorkspace";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { experienciaModeloMental, experienciaLabel } from "@/experience/roles";

export default function Home() {
  const { experiencia, shell } = useExperience();

  const conteudo = (
    <div className="flex max-w-3xl flex-col gap-8">
      <div>
        <p className="type-label text-steel">Fase 1 — Foundation</p>
        <h1 className="type-display mt-2 text-navy">LUNAR</h1>
        <p className="type-body mt-3 text-steel">
          Fundação do produto: tokens de design, tipografia, arquitetura de
          domínio e o shell de experiências. Nenhum módulo operacional foi
          implementado ainda.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status="disponivel" />
        <StatusBadge status="pendente" />
        <StatusBadge status="atencao" />
        <StatusBadge status="divergencia" />
      </div>

      <div>
        <p className="type-label text-steel">Modelo mental — {experienciaLabel[experiencia]}</p>
        <p className="type-h2 mt-1">{experienciaModeloMental[experiencia]}</p>
      </div>

      <EmptyState
        titulo="Nenhum módulo operacional disponível ainda"
        descricao="Recebimento, picking, packing, expedição e os demais módulos serão construídos nas próximas fases, sobre esta fundação."
      />
    </div>
  );

  return shell === "admin" ? <AdminShell>{conteudo}</AdminShell> : <LunarWorkspace>{conteudo}</LunarWorkspace>;
}
