/**
 * LUNAR - Dominio: Cross-docking
 *
 * RECEBIMENTO -> CHECAGEM -> VINCULO COM A DEMANDA -> EXPEDICAO
 *
 * O estoque e real (passa pelo motor de estoque), mas nunca vai para
 * put-away/armazenagem - e vinculado a um pedido e sai direto (item 28
 * do spec).
 */

export type StatusCrossDocking = "recebido" | "vinculado" | "expedido";

export interface OperacaoCrossDocking {
  id: string;
  produtoId: string;
  quantidade: number;
  enderecoId: string;
  posicaoEstoqueId: string;
  pedidoId?: string;
  itemPedidoId?: string;
  status: StatusCrossDocking;
  criadoEm: string;
}
