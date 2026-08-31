/**
 * LUNAR - Dominio: Packing (Volumes)
 *
 * PEDIDO -> VOLUME -> ITENS -> CONFERENCIA -> PESO -> DIMENSOES -> FECHAMENTO -> ETIQUETA
 *
 * MONTAR VOLUME (itens) e FECHAR VOLUME (peso/dimensoes) sao acoes
 * distintas (item 23 do spec) - nao acontecem no mesmo passo.
 */

export type StatusVolume = "montando" | "fechado";

export interface ItemVolume {
  produtoId: string;
  quantidade: number;
}

export interface Volume {
  id: string;
  pedidoId: string;
  status: StatusVolume;
  itens: ItemVolume[];
  pesoKg?: number;
  alturaCm?: number;
  larguraCm?: number;
  comprimentoCm?: number;
  criadoEm: string;
  fechadoEm?: string;
}
