/**
 * LUNAR — Ponto de Extensão de Persistência
 *
 * Fase 2 usa um repositório em memória (client-side). A interface abaixo
 * é o ponto de extensão: quando o Supabase entrar, criamos um
 * SupabaseRepository que implementa o mesmo contrato e trocamos a
 * implementação em `data/store.tsx` — sem reescrever telas.
 *
 * Nenhum componente deve manipular arrays de estado diretamente; tudo
 * passa pelas operações abaixo (via useEstrutura()/useProdutos()).
 */

import type {
  Empresa,
  CentroDistribuicao,
  Armazem,
  Zona,
  Area,
  Endereco,
} from "@/domain/warehouse";
import type { Produto } from "@/domain/produto";

export interface RepositorioEstrutura {
  empresas: Empresa[];
  centros: CentroDistribuicao[];
  armazens: Armazem[];
  zonas: Zona[];
  areas: Area[];
  enderecos: Endereco[];

  criarEmpresa(dados: Omit<Empresa, "id">): void;
  criarCentro(dados: Omit<CentroDistribuicao, "id">): void;
  criarArmazem(dados: Omit<Armazem, "id">): void;
  criarZona(dados: Omit<Zona, "id">): void;
  criarArea(dados: Omit<Area, "id">): void;
  criarEndereco(dados: Omit<Endereco, "id">): void;
}

export interface RepositorioProdutos {
  produtos: Produto[];
  criarProduto(dados: Omit<Produto, "id">): void;
}

export function gerarId(prefixo: string): string {
  return `${prefixo}_${Math.random().toString(36).slice(2, 10)}`;
}
