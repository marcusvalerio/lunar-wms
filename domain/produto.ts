/**
 * LUNAR — Domínio: Produto
 *
 * Estrutura mínima capaz de crescer para capacidades avançadas
 * (lote, validade, serial, variante) sem precisar de retrabalho.
 */

export type UnidadeMedida = "UN" | "CX" | "PLT" | "KG" | "L";

export interface Produto {
  id: string;
  sku: string;
  codigoBarras?: string;
  descricao: string;
  unidade: UnidadeMedida;
  categoria?: string;
  ativo: boolean;

  dimensoes?: {
    alturaCm: number;
    larguraCm: number;
    comprimentoCm: number;
  };
  pesoKg?: number;

  controlaLote: boolean;
  controlaValidade: boolean;
  controlaSerial: boolean;

  restricoesArmazenagem?: string[];
  restricoesPicking?: string[];
}
