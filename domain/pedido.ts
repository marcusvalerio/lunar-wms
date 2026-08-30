/**
 * LUNAR — Domínio: Pedido
 *
 * Ciclo de vida:
 *   RECEBIDO → ANÁLISE → RESERVADO → ALOCADO → PLANEJADO →
 *   PICKING → CONFERÊNCIA → PACKING → EXPEDIÇÃO → CONCLUÍDO
 *
 * Reserva ≠ Alocação ≠ Estoque físico (ver item 14/15 do spec):
 *   - Reserva: garante estoque sem definir de onde vem.
 *   - Alocação: decide qual estoque específico atende a demanda.
 */

export type StatusPedido =
  | "recebido"
  | "analise"
  | "reservado"
  | "alocado"
  | "planejado"
  | "picking"
  | "conferencia"
  | "packing"
  | "expedicao"
  | "concluido"
  | "cancelado";

export type PrioridadePedido = "critica" | "alta" | "normal" | "baixa";

export interface ItemPedido {
  id: string;
  pedidoId: string;
  produtoId: string;
  quantidadeSolicitada: number;
  quantidadeReservada: number;
  quantidadeAlocada: number;
  quantidadeExpedida: number;
}

export interface Pedido {
  id: string;
  numero: string;
  status: StatusPedido;
  prioridade: PrioridadePedido;
  clienteId?: string;
  criadoEm: string; // ISO datetime
  itens: ItemPedido[];
}

/** Estratégia de alocação — regras determinísticas antes de qualquer IA. */
export type EstrategiaAlocacao = "FIFO" | "FEFO" | "LIFO";
