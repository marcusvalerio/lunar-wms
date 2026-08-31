"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Pedido, ItemPedido, StatusPedido, PrioridadePedido } from "@/domain/pedido";
import { gerarId } from "./repository";

interface RepositorioPedidos {
  pedidos: Pedido[];

  criarPedido(dados: {
    numero: string;
    prioridade: PrioridadePedido;
    clienteId?: string;
    itens: { produtoId: string; quantidadeSolicitada: number }[];
  }): void;

  atualizarItens(pedidoId: string, itens: ItemPedido[], novoStatus: StatusPedido): void;
  cancelarPedido(pedidoId: string): void;
}

const PedidosContext = createContext<RepositorioPedidos | null>(null);

export function OrderStoreProvider({ children }: { children: ReactNode }) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  function criarPedido(dados: {
    numero: string;
    prioridade: PrioridadePedido;
    clienteId?: string;
    itens: { produtoId: string; quantidadeSolicitada: number }[];
  }) {
    const pedidoId = gerarId("pedido");
    const itens: ItemPedido[] = dados.itens.map((item) => ({
      id: gerarId("item"),
      pedidoId,
      produtoId: item.produtoId,
      quantidadeSolicitada: item.quantidadeSolicitada,
      quantidadeReservada: 0,
      quantidadeAlocada: 0,
      quantidadeExpedida: 0,
    }));

    const novoPedido: Pedido = {
      id: pedidoId,
      numero: dados.numero,
      status: "recebido",
      prioridade: dados.prioridade,
      clienteId: dados.clienteId,
      criadoEm: new Date().toISOString(),
      itens,
    };

    setPedidos((prev) => [...prev, novoPedido]);
  }

  function atualizarItens(pedidoId: string, itens: ItemPedido[], novoStatus: StatusPedido) {
    setPedidos((prev) => prev.map((p) => (p.id === pedidoId ? { ...p, itens, status: novoStatus } : p)));
  }

  function cancelarPedido(pedidoId: string) {
    setPedidos((prev) => prev.map((p) => (p.id === pedidoId ? { ...p, status: "cancelado" } : p)));
  }

  const value: RepositorioPedidos = { pedidos, criarPedido, atualizarItens, cancelarPedido };

  return <PedidosContext.Provider value={value}>{children}</PedidosContext.Provider>;
}

export function usePedidos(): RepositorioPedidos {
  const ctx = useContext(PedidosContext);
  if (!ctx) throw new Error("usePedidos deve ser usado dentro de um OrderStoreProvider");
  return ctx;
}
