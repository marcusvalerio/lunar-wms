/**
 * LUNAR - Dominio: Recebimento
 *
 * RECEBIMENTO -> DOCUMENTO -> CHECAGEM -> IDENTIFICACAO -> QUANTIDADE ->
 * LOTE/VALIDADE/SERIAL -> APROVACAO -> PUT-AWAY
 *
 * Este e o primeiro fluxo operacional completo do LUNAR (item 16 do
 * spec): conecta o motor de tarefas (Fase 5) ao motor de estoque
 * (Fase 3) atraves da conferencia e do put-away.
 */

export type StatusDocumentoRecebimento = "aberto" | "em_conferencia" | "aprovado" | "concluido";

export type StatusItemRecebimento = "pendente" | "conferido" | "aguardando_putaway" | "concluido";

export interface ItemRecebimento {
  id: string;
  documentoId: string;
  produtoId: string;
  quantidadeEsperada: number;

  status: StatusItemRecebimento;
  quantidadeRecebida?: number;
  lote?: string;
  validade?: string;

  tarefaPutawayId?: string;
  enderecoDestinoId?: string;
}

export interface DocumentoRecebimento {
  id: string;
  numero: string;
  status: StatusDocumentoRecebimento;
  criadoEm: string;
  itens: ItemRecebimento[];
}
