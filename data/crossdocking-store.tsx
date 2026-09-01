"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { OperacaoCrossDocking } from "@/domain/crossdocking";
import { gerarId } from "./repository";

interface RepositorioCrossDocking {
  operacoes: OperacaoCrossDocking[];

  criarOperacao(dados: { produtoId: string; quantidade: number; enderecoId: string; posicaoEstoqueId: string }): string;
  vincular(id: string, pedidoId: string, itemPedidoId: string): void;
  expedir(id: string): void;
}

const CrossDockingContext = createContext<RepositorioCrossDocking | null>(null);

export function CrossDockingStoreProvider({ children }: { children: ReactNode }) {
  const [operacoes, setOperacoes] = useState<OperacaoCrossDocking[]>([]);

  function criarOperacao(dados: { produtoId: string; quantidade: number; enderecoId: string; posicaoEstoqueId: string }): string {
    const id = gerarId("crossdock");
    setOperacoes((prev) => [...prev, { id, ...dados, status: "recebido", criadoEm: new Date().toISOString() }]);
    return id;
  }

  function vincular(id: string, pedidoId: string, itemPedidoId: string) {
    setOperacoes((prev) => prev.map((op) => (op.id === id ? { ...op, pedidoId, itemPedidoId, status: "vinculado" } : op)));
  }

  function expedir(id: string) {
    setOperacoes((prev) => prev.map((op) => (op.id === id ? { ...op, status: "expedido" } : op)));
  }

  const value: RepositorioCrossDocking = { operacoes, criarOperacao, vincular, expedir };

  return <CrossDockingContext.Provider value={value}>{children}</CrossDockingContext.Provider>;
}

export function useCrossDocking(): RepositorioCrossDocking {
  const ctx = useContext(CrossDockingContext);
  if (!ctx) throw new Error("useCrossDocking deve ser usado dentro de um CrossDockingStoreProvider");
  return ctx;
}
