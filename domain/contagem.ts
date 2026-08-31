/**
 * LUNAR - Dominio: Contagem de Inventario
 *
 * CONTAGEM -> PRODUTO -> LOCALIZACAO -> QUANTIDADE ESPERADA ->
 * QUANTIDADE CONTADA -> DIVERGENCIA -> RECONTAGEM -> APROVACAO
 *
 * Se esperado = contado, a contagem conclui direto, sem forcar
 * recontagem (item 24 do spec).
 */

export type StatusContagem = "pendente" | "divergente" | "recontagem" | "aguardando_aprovacao" | "concluida";

export interface Contagem {
  id: string;
  posicaoEstoqueId: string;
  produtoId: string;
  enderecoId: string;
  quantidadeEsperada: number;
  quantidadeContada?: number;
  quantidadeRecontada?: number;
  status: StatusContagem;
  criadaEm: string;
}
