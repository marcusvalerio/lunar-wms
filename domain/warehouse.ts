/**
 * LUNAR — Domínio: Estrutura Física do Armazém
 *
 *   EMPRESA → CENTRO DE DISTRIBUIÇÃO → ARMAZÉM → ZONA → ÁREA → ENDEREÇO
 *
 * Este arquivo define apenas a FORMA do domínio (Fase 1 — Foundation).
 * Nenhuma lógica operacional, nenhuma persistência ainda.
 */

export type StatusEstrutural = "ativo" | "inativo" | "em_configuracao";

export interface Empresa {
  id: string;
  nome: string;
  status: StatusEstrutural;
}

export interface CentroDistribuicao {
  id: string;
  empresaId: string;
  nome: string;
  codigo: string;
  status: StatusEstrutural;
  endereco?: string;
}

export interface Armazem {
  id: string;
  centroDistribuicaoId: string;
  nome: string;
  codigo: string;
  status: StatusEstrutural;
}

/** Zonas operacionais típicas de um armazém. */
export type TipoZona =
  | "recebimento"
  | "armazenagem"
  | "picking"
  | "packing"
  | "expedicao"
  | "quarentena"
  | "devolucoes";

export interface Zona {
  id: string;
  armazemId: string;
  tipo: TipoZona;
  nome: string;
  status: StatusEstrutural;
}

/** Áreas subdividem uma zona operacional. */
export interface Area {
  id: string;
  zonaId: string;
  nome: string;
}

/**
 * Endereço físico dentro de uma área — ex: "A-03-14-02".
 * O formato do código é livre; o sistema não deve assumir uma máscara fixa.
 */
export interface Endereco {
  id: string;
  areaId: string;
  codigo: string;
  status: StatusEstrutural;
}

/** Caminho estrutural completo — usado para navegação e breadcrumbs. */
export interface CaminhoEstrutural {
  empresa: Empresa;
  centroDistribuicao: CentroDistribuicao;
  armazem: Armazem;
  zona: Zona;
  area?: Area;
  endereco?: Endereco;
}
