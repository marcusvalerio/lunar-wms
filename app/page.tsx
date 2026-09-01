"use client";

import Link from "next/link";
import { useExperience } from "@/experience/provider";
import { AdminShell } from "@/components/AdminShell";
import { LunarWorkspace } from "@/components/LunarWorkspace";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { OperationalPicking } from "@/components/OperationalPicking";
import { experienciaModeloMental, experienciaLabel } from "@/experience/roles";

export default function Home() {
  const { experiencia, shell } = useExperience();

  if (experiencia === "operacional") {
    return (
      <LunarWorkspace>
        <OperationalPicking />
      </LunarWorkspace>
    );
  }

  const conteudo = (
    <div className="flex max-w-3xl flex-col gap-8">
      <div>
        <p className="type-label text-steel">Fase 10 — Returns + Cross-docking</p>
        <h1 className="type-display mt-2 text-navy">LUNAR</h1>
        <p className="type-body mt-3 text-steel">
          Fundação do produto: tokens de design, tipografia, arquitetura de
          domínio e o shell de experiências.
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

      {shell === "admin" ? (
        <div className="flex flex-col gap-2">
          <p className="type-label text-steel">Módulos administrativos</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/estrutura" className="type-body-small rounded-md border border-mist px-3 py-2 hover:bg-stone">
              Estrutura do armazém →
            </Link>
            <Link href="/admin/produtos" className="type-body-small rounded-md border border-mist px-3 py-2 hover:bg-stone">
              Produtos →
            </Link>
            <Link href="/admin/estoque" className="type-body-small rounded-md border border-mist px-3 py-2 hover:bg-stone">
              Estoque →
            </Link>
            <Link href="/admin/pedidos" className="type-body-small rounded-md border border-mist px-3 py-2 hover:bg-stone">
              Pedidos →
            </Link>
            <Link href="/admin/tarefas" className="type-body-small rounded-md border border-mist px-3 py-2 hover:bg-stone">
              Tarefas →
            </Link>
            <Link href="/admin/recebimento" className="type-body-small rounded-md border border-mist px-3 py-2 hover:bg-stone">
              Recebimento →
            </Link>
            <Link href="/admin/packing" className="type-body-small rounded-md border border-mist px-3 py-2 hover:bg-stone">
              Packing →
            </Link>
            <Link href="/admin/inventario" className="type-body-small rounded-md border border-mist px-3 py-2 hover:bg-stone">
              Inventário →
            </Link>
            <Link href="/admin/devolucoes" className="type-body-small rounded-md border border-mist px-3 py-2 hover:bg-stone">
              Devoluções →
            </Link>
            <Link href="/admin/cross-docking" className="type-body-small rounded-md border border-mist px-3 py-2 hover:bg-stone">
              Cross-docking →
            </Link>
          </div>
        </div>
      ) : (
        <EmptyState
          titulo="Nenhum módulo disponível para esta experiência ainda"
          descricao="Gestão, Tático e Supervisão serão construídos nas próximas fases."
        />
      )}
    </div>
  );

  return shell === "admin" ? <AdminShell>{conteudo}</AdminShell> : <LunarWorkspace>{conteudo}</LunarWorkspace>;
}

