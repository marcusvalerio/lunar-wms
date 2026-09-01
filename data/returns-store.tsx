"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Devolucao, MotivoDevolucao, CondicaoProduto, DecisaoDevolucao } from "@/domain/devolucao";
import { gerarId } from "./repository";

interface RepositorioDevolucao {
  devolucoes: Devolucao[];

  criarDevolucao(dados: { numero: string; produtoId: string; quantidade: number; motivo: MotivoDevolucao }): void;
  registrarInspecao(id: string, condicao: CondicaoProduto): void;
  decidir(id: string, decisao: DecisaoDevolucao, enderecoDestinoId?: string): void;
  concluir(id: string): void;
}

const DevolucaoContext = createContext<RepositorioDevolucao | null>(null);

export function ReturnsStoreProvider({ children }: { children: ReactNode }) {
  const [devolucoes, setDevolucoes] = useState<Devolucao[]>([]);

  function criarDevolucao(dados: { numero: string; produtoId: string; quantidade: number; motivo: MotivoDevolucao }) {
    setDevolucoes((prev) => [
      ...prev,
      { id: gerarId("devolucao"), ...dados, status: "recebida", criadaEm: new Date().toISOString() },
    ]);
  }

  function registrarInspecao(id: string, condicao: CondicaoProduto) {
    setDevolucoes((prev) => prev.map((d) => (d.id === id ? { ...d, condicao, status: "em_inspecao" } : d)));
  }

  function decidir(id: string, decisao: DecisaoDevolucao, enderecoDestinoId?: string) {
    setDevolucoes((prev) => prev.map((d) => (d.id === id ? { ...d, decisao, enderecoDestinoId, status: "decidida" } : d)));
  }

  function concluir(id: string) {
    setDevolucoes((prev) => prev.map((d) => (d.id === id ? { ...d, status: "concluida" } : d)));
  }

  const value: RepositorioDevolucao = { devolucoes, criarDevolucao, registrarInspecao, decidir, concluir };

  return <DevolucaoContext.Provider value={value}>{children}</DevolucaoContext.Provider>;
}

export function useDevolucao(): RepositorioDevolucao {
  const ctx = useContext(DevolucaoContext);
  if (!ctx) throw new Error("useDevolucao deve ser usado dentro de um ReturnsStoreProvider");
  return ctx;
}
