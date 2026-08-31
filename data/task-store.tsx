"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Tarefa, TipoTarefa, PrioridadeTarefa, TipoExcecao } from "@/domain/tarefa";
import { gerarId } from "./repository";

interface RepositorioTarefas {
  tarefas: Tarefa[];

  criarTarefa(dados: {
    tipo: TipoTarefa;
    prioridade: PrioridadeTarefa;
    produtoId?: string;
    quantidade?: number;
    enderecoOrigemId?: string;
    enderecoDestinoId?: string;
    posicaoEstoqueId?: string;
    dependeDe?: string[];
  }): string;

  /** Uma tarefa só pode iniciar se todas as dependências estiverem concluídas. */
  podeIniciar(tarefaId: string): boolean;
  iniciarTarefa(tarefaId: string, operadorId: string): void;
  concluirTarefa(tarefaId: string): void;
  reportarExcecao(tarefaId: string, tipo: TipoExcecao, descricao: string): void;
  resolverExcecao(tarefaId: string): void;
  cancelarTarefa(tarefaId: string): void;
}

const TarefasContext = createContext<RepositorioTarefas | null>(null);

export function TaskStoreProvider({ children }: { children: ReactNode }) {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);

  function criarTarefa(dados: {
    tipo: TipoTarefa;
    prioridade: PrioridadeTarefa;
    produtoId?: string;
    quantidade?: number;
    enderecoOrigemId?: string;
    enderecoDestinoId?: string;
    posicaoEstoqueId?: string;
    dependeDe?: string[];
  }): string {
    const id = gerarId("tarefa");
    const novaTarefa: Tarefa = {
      id,
      tipo: dados.tipo,
      prioridade: dados.prioridade,
      status: "disponivel",
      produtoId: dados.produtoId,
      quantidade: dados.quantidade,
      enderecoOrigemId: dados.enderecoOrigemId,
      enderecoDestinoId: dados.enderecoDestinoId,
      posicaoEstoqueId: dados.posicaoEstoqueId,
      dependeDe: dados.dependeDe,
      criadaEm: new Date().toISOString(),
    };
    setTarefas((prev) => [...prev, novaTarefa]);
    return id;
  }

  function podeIniciar(tarefaId: string): boolean {
    const tarefa = tarefas.find((t) => t.id === tarefaId);
    if (!tarefa || tarefa.status !== "disponivel") return false;
    if (!tarefa.dependeDe || tarefa.dependeDe.length === 0) return true;
    return tarefa.dependeDe.every((depId) => tarefas.find((t) => t.id === depId)?.status === "concluida");
  }

  function iniciarTarefa(tarefaId: string, operadorId: string) {
    if (!podeIniciar(tarefaId)) return;
    setTarefas((prev) =>
      prev.map((t) =>
        t.id === tarefaId ? { ...t, status: "em_execucao", operadorId, iniciadaEm: new Date().toISOString() } : t
      )
    );
  }

  function concluirTarefa(tarefaId: string) {
    setTarefas((prev) =>
      prev.map((t) => (t.id === tarefaId && t.status === "em_execucao" ? { ...t, status: "concluida", concluidaEm: new Date().toISOString() } : t))
    );
  }

  function reportarExcecao(tarefaId: string, tipo: TipoExcecao, descricao: string) {
    setTarefas((prev) =>
      prev.map((t) =>
        t.id === tarefaId
          ? {
              ...t,
              status: "bloqueada",
              excecao: { id: gerarId("excecao"), tipo, descricao, detectadaEm: new Date().toISOString() },
            }
          : t
      )
    );
  }

  function resolverExcecao(tarefaId: string) {
    setTarefas((prev) =>
      prev.map((t) =>
        t.id === tarefaId && t.excecao
          ? { ...t, status: "disponivel", excecao: { ...t.excecao, resolvidaEm: new Date().toISOString() } }
          : t
      )
    );
  }

  function cancelarTarefa(tarefaId: string) {
    setTarefas((prev) => prev.map((t) => (t.id === tarefaId ? { ...t, status: "cancelada" } : t)));
  }

  const value: RepositorioTarefas = {
    tarefas,
    criarTarefa,
    podeIniciar,
    iniciarTarefa,
    concluirTarefa,
    reportarExcecao,
    resolverExcecao,
    cancelarTarefa,
  };

  return <TarefasContext.Provider value={value}>{children}</TarefasContext.Provider>;
}

export function useTarefas(): RepositorioTarefas {
  const ctx = useContext(TarefasContext);
  if (!ctx) throw new Error("useTarefas deve ser usado dentro de um TaskStoreProvider");
  return ctx;
}
