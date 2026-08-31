/**
 * LUNAR — Domínio: Estoque
 *
 * Estoque não é um campo de quantidade no produto. É a combinação de
 * PRODUTO + ENDEREÇO + LOTE + SERIAL + VALIDADE + STATUS + QUANTIDADE,
 * e o saldo deriva de movimentos rastreáveis (Ledger), não de mutação
 * arbitrária.
 */

export type StatusEstoque =
  | "disponivel"
  | "reservado"
  | "bloqueado"
  | "quarentena"
  | "avariado"
  | "vencido";

export interface PosicaoEstoque {
  id: string;
  produtoId: string;
  enderecoId: string;
  lote?: string;
  serial?: string;
  validade?: string; // ISO date
  status: StatusEstoque;
  quantidade: number;
  criadaEm: string; // ISO datetime — base para FIFO/LIFO
}

/** Tipos de movimento suportados pelo ledger de estoque. */
export type TipoMovimento =
  | "entrada"
  | "transferencia"
  | "reserva"
  | "liberacao"
  | "picking"
  | "ajuste"
  | "bloqueio"
  | "desbloqueio"
  | "expedicao"
  | "devolucao";

export interface MovimentoEstoque {
  id: string;
  tipo: TipoMovimento;
  produtoId: string;
  enderecoOrigemId?: string;
  enderecoDestinoId?: string;
  lote?: string;
  serial?: string;
  quantidade: number;
  motivo?: string;
  criadoEm: string; // ISO datetime
  criadoPor?: string; // operador/usuário — auditabilidade (item 75)
}

/**
 * Saldo derivado — nunca deve ser escrito diretamente.
 * Físico = soma de posições. Disponível = físico - reservado - bloqueado.
 */
export interface SaldoEstoque {
  produtoId: string;
  enderecoId: string;
  fisico: number;
  reservado: number;
  bloqueado: number;
  disponivel: number;
}
