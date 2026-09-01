/**
 * LUNAR - Dominio: Devolucao
 *
 * DEVOLUCAO -> RECEBIMENTO -> CHECAGEM -> MOTIVO -> CONDICAO -> DECISAO ->
 * ESTOQUE / QUARENTENA / DESCARTE
 *
 * Nunca devolve automaticamente para o estoque disponivel (item 27 do
 * spec) - a decisao e sempre explicita.
 */

export type MotivoDevolucao = "avaria" | "divergencia_pedido" | "insatisfacao_cliente" | "produto_incorreto" | "outro";

export type CondicaoProduto = "boa" | "avariada" | "impropria_para_venda";

export type DecisaoDevolucao = "estoque" | "quarentena" | "descarte";

export type StatusDevolucao = "recebida" | "em_inspecao" | "decidida" | "concluida";

export interface Devolucao {
  id: string;
  numero: string;
  produtoId: string;
  quantidade: number;
  motivo: MotivoDevolucao;
  status: StatusDevolucao;
  condicao?: CondicaoProduto;
  decisao?: DecisaoDevolucao;
  enderecoDestinoId?: string;
  criadaEm: string;
}
