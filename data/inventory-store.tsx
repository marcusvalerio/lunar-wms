"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { PosicaoEstoque, MovimentoEstoque, SaldoEstoque } from "@/domain/estoque";
import type { EstrategiaAlocacao } from "@/domain/pedido";
import { alocarEstoque, type ResultadoAlocacao } from "@/domain/alocacao";
import { gerarId } from "./repository";

/**
 * Reserva — garante estoque sem definir fisicamente de onde vem até a
 * alocação decidir (item 14/15 do spec). Guarda a alocação já resolvida
 * para simplificar esta fase (reserva + alocação acontecem juntas).
 */
export interface Reserva {
  id: string;
  produtoId: string;
  quantidadeSolicitada: number;
  estrategia: EstrategiaAlocacao;
  alocacoes: { posicaoId: string; quantidade: number }[];
  quantidadeNaoAtendida: number;
  criadaEm: string;
}

interface RepositorioEstoque {
  posicoes: PosicaoEstoque[];
  movimentos: MovimentoEstoque[];
  reservas: Reserva[];

  registrarEntrada(dados: { produtoId: string; enderecoId: string; quantidade: number; lote?: string; validade?: string }): void;
  reservar(produtoId: string, quantidade: number, estrategia: EstrategiaAlocacao): ResultadoAlocacao;
  saldoDaPosicao(posicaoId: string): SaldoEstoque;
  /** Confirma o picking: baixa o físico da posição e libera a reserva correspondente. */
  confirmarPicking(posicaoId: string, quantidade: number): void;
}

const EstoqueContext = createContext<RepositorioEstoque | null>(null);

export function InventoryStoreProvider({ children }: { children: ReactNode }) {
  const [posicoes, setPosicoes] = useState<PosicaoEstoque[]>([]);
  const [movimentos, setMovimentos] = useState<MovimentoEstoque[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);

  function quantidadeReservadaNaPosicao(posicaoId: string, listaReservas: Reserva[]): number {
    return listaReservas.reduce((soma, reserva) => {
      const alocacao = reserva.alocacoes.find((a) => a.posicaoId === posicaoId);
      return soma + (alocacao?.quantidade ?? 0);
    }, 0);
  }

  function saldoDaPosicao(posicaoId: string): SaldoEstoque {
    const posicao = posicoes.find((p) => p.id === posicaoId);
    const fisico = posicao?.quantidade ?? 0;
    const bloqueado = posicao && posicao.status !== "disponivel" ? fisico : 0;
    const reservado = quantidadeReservadaNaPosicao(posicaoId, reservas);
    const disponivel = bloqueado > 0 ? 0 : Math.max(0, fisico - reservado);
    return {
      produtoId: posicao?.produtoId ?? "",
      enderecoId: posicao?.enderecoId ?? "",
      fisico,
      reservado,
      bloqueado,
      disponivel,
    };
  }

  function registrarEntrada(dados: { produtoId: string; enderecoId: string; quantidade: number; lote?: string; validade?: string }) {
    const agora = new Date().toISOString();
    const novaPosicao: PosicaoEstoque = {
      id: gerarId("posicao"),
      produtoId: dados.produtoId,
      enderecoId: dados.enderecoId,
      lote: dados.lote,
      validade: dados.validade,
      status: "disponivel",
      quantidade: dados.quantidade,
      criadaEm: agora,
    };
    setPosicoes((prev) => [...prev, novaPosicao]);
    setMovimentos((prev) => [
      ...prev,
      {
        id: gerarId("mov"),
        tipo: "entrada",
        produtoId: dados.produtoId,
        enderecoDestinoId: dados.enderecoId,
        lote: dados.lote,
        quantidade: dados.quantidade,
        criadoEm: agora,
      },
    ]);
  }

  function reservar(produtoId: string, quantidade: number, estrategia: EstrategiaAlocacao): ResultadoAlocacao {
    const agora = new Date().toISOString();
    const posicoesDoProduto = posicoes.filter((p) => p.produtoId === produtoId && p.status === "disponivel");
    const posicoesAlocaveis = posicoesDoProduto.map((p) => ({
      posicaoId: p.id,
      quantidadeDisponivel: saldoDaPosicao(p.id).disponivel,
      criadaEm: p.criadaEm,
      validade: p.validade,
    }));

    const resultado = alocarEstoque(posicoesAlocaveis, quantidade, estrategia);

    if (resultado.alocacoes.length > 0) {
      setReservas((prev) => [
        ...prev,
        {
          id: gerarId("reserva"),
          produtoId,
          quantidadeSolicitada: quantidade,
          estrategia,
          alocacoes: resultado.alocacoes,
          quantidadeNaoAtendida: resultado.quantidadeNaoAtendida,
          criadaEm: agora,
        },
      ]);
      setMovimentos((prev) => [
        ...prev,
        ...resultado.alocacoes.map((a) => ({
          id: gerarId("mov"),
          tipo: "reserva" as const,
          produtoId,
          enderecoOrigemId: posicoes.find((p) => p.id === a.posicaoId)?.enderecoId,
          quantidade: a.quantidade,
          criadoEm: agora,
        })),
      ]);
    }

    return resultado;
  }

  function confirmarPicking(posicaoId: string, quantidade: number) {
    const agora = new Date().toISOString();
    const posicao = posicoes.find((p) => p.id === posicaoId);
    if (!posicao) return;

    setPosicoes((prev) => prev.map((p) => (p.id === posicaoId ? { ...p, quantidade: Math.max(0, p.quantidade - quantidade) } : p)));

    // Libera a reserva correspondente — o picking cumpre o que estava reservado.
    setReservas((prev) =>
      prev
        .map((reserva) => ({
          ...reserva,
          alocacoes: reserva.alocacoes
            .map((a) => (a.posicaoId === posicaoId ? { ...a, quantidade: Math.max(0, a.quantidade - quantidade) } : a))
            .filter((a) => a.quantidade > 0),
        }))
        .filter((reserva) => reserva.alocacoes.length > 0)
    );

    setMovimentos((prev) => [
      ...prev,
      {
        id: gerarId("mov"),
        tipo: "picking" as const,
        produtoId: posicao.produtoId,
        enderecoOrigemId: posicao.enderecoId,
        quantidade,
        criadoEm: agora,
      },
    ]);
  }

  const value: RepositorioEstoque = { posicoes, movimentos, reservas, registrarEntrada, reservar, saldoDaPosicao, confirmarPicking };

  return <EstoqueContext.Provider value={value}>{children}</EstoqueContext.Provider>;
}

export function useEstoque(): RepositorioEstoque {
  const ctx = useContext(EstoqueContext);
  if (!ctx) throw new Error("useEstoque deve ser usado dentro de um InventoryStoreProvider");
  return ctx;
}
