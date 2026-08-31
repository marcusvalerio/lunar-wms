"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Contagem } from "@/domain/contagem";
import { gerarId } from "./repository";

interface RepositorioContagem {
  contagens: Contagem[];

  criarContagem(dados: { posicaoEstoqueId: string; produtoId: string; enderecoId: string; quantidadeEsperada: number }): void;
  registrarContagem(id: string, quantidadeContada: number): void;
  solicitarRecontagem(id: string): void;
  registrarRecontagem(id: string, quantidadeRecontada: number): void;
  concluirSemAjuste(id: string): void;
  concluirComAjuste(id: string): void;
}

const ContagemContext = createContext<RepositorioContagem | null>(null);

export function CountingStoreProvider({ children }: { children: ReactNode }) {
  const [contagens, setContagens] = useState<Contagem[]>([]);

  function criarContagem(dados: { posicaoEstoqueId: string; produtoId: string; enderecoId: string; quantidadeEsperada: number }) {
    setContagens((prev) => [
      ...prev,
      { id: gerarId("contagem"), ...dados, status: "pendente", criadaEm: new Date().toISOString() },
    ]);
  }

  function registrarContagem(id: string, quantidadeContada: number) {
    setContagens((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, quantidadeContada, status: quantidadeContada === c.quantidadeEsperada ? "concluida" : "divergente" }
          : c
      )
    );
  }

  function solicitarRecontagem(id: string) {
    setContagens((prev) => prev.map((c) => (c.id === id ? { ...c, status: "recontagem" } : c)));
  }

  function registrarRecontagem(id: string, quantidadeRecontada: number) {
    setContagens((prev) => prev.map((c) => (c.id === id ? { ...c, quantidadeRecontada, status: "aguardando_aprovacao" } : c)));
  }

  /** A contagem original era o erro — nenhum ajuste de estoque é necessário. */
  function concluirSemAjuste(id: string) {
    setContagens((prev) => prev.map((c) => (c.id === id ? { ...c, status: "concluida" } : c)));
  }

  function concluirComAjuste(id: string) {
    setContagens((prev) => prev.map((c) => (c.id === id ? { ...c, status: "concluida" } : c)));
  }

  const value: RepositorioContagem = {
    contagens,
    criarContagem,
    registrarContagem,
    solicitarRecontagem,
    registrarRecontagem,
    concluirSemAjuste,
    concluirComAjuste,
  };

  return <ContagemContext.Provider value={value}>{children}</ContagemContext.Provider>;
}

export function useContagem(): RepositorioContagem {
  const ctx = useContext(ContagemContext);
  if (!ctx) throw new Error("useContagem deve ser usado dentro de um CountingStoreProvider");
  return ctx;
}
