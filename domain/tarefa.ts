/**
 * LUNAR — Domínio: Tarefa (Motor de Tarefas)
 *
 * Tudo que é operacional deve poder ser representado como uma Tarefa.
 * Este é o "sistema nervoso" operacional do LUNAR (item 30 do spec).
 */

export type TipoTarefa =
  | "recebimento"
  | "putaway"
  | "reabastecimento"
  | "picking"
  | "packing"
  | "inventario"
  | "transferencia"
  | "expedicao"
  | "devolucao";

export type StatusTarefa =
  | "disponivel"
  | "em_execucao"
  | "concluida"
  | "bloqueada"
  | "cancelada";

export type PrioridadeTarefa = "critica" | "alta" | "normal" | "baixa";

export interface Tarefa {
  id: string;
  tipo: TipoTarefa;
  prioridade: PrioridadeTarefa;
  status: StatusTarefa;

  produtoId?: string;
  quantidade?: number;
  enderecoOrigemId?: string;
  enderecoDestinoId?: string;
  /** Posição de estoque específica de origem — necessário para picking baixar o físico certo. */
  posicaoEstoqueId?: string;

  operadorId?: string;
  equipamentoId?: string;

  criadaEm: string; // ISO datetime
  iniciadaEm?: string;
  concluidaEm?: string;
  duracaoEsperadaSegundos?: number;

  dependeDe?: string[]; // ids de outras tarefas
  excecao?: ExcecaoTarefa;
}

export type TipoExcecao =
  | "produto_ausente"
  | "codigo_incorreto"
  | "estoque_insuficiente"
  | "produto_avariado"
  | "endereco_bloqueado"
  | "divergencia_quantidade"
  | "tarefa_atrasada"
  | "divergencia_packing"
  | "divergencia_inventario";

export interface ExcecaoTarefa {
  id: string;
  tipo: TipoExcecao;
  descricao: string;
  detectadaEm: string; // ISO datetime
  resolvidaEm?: string;
}
