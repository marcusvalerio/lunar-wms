"use client";

import { createContext, useContext, useState, useMemo, type ReactNode } from "react";
import type { Empresa, CentroDistribuicao, Armazem, Zona, Area, Endereco } from "@/domain/warehouse";
import type { Produto } from "@/domain/produto";
import { gerarId, type RepositorioEstrutura, type RepositorioProdutos } from "./repository";

/**
 * Loja em memória (Fase 2). Vazia por padrão — nada de dados fictícios
 * misturados ao domínio (item 96 do spec). Ao adicionar Supabase, esta
 * é a única camada que muda.
 */

const EstruturaContext = createContext<RepositorioEstrutura | null>(null);
const ProdutosContext = createContext<RepositorioProdutos | null>(null);

export function DataStoreProvider({ children }: { children: ReactNode }) {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [centros, setCentros] = useState<CentroDistribuicao[]>([]);
  const [armazens, setArmazens] = useState<Armazem[]>([]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [enderecos, setEnderecos] = useState<Endereco[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);

  const estrutura: RepositorioEstrutura = useMemo(
    () => ({
      empresas,
      centros,
      armazens,
      zonas,
      areas,
      enderecos,
      criarEmpresa: (dados) => setEmpresas((prev) => [...prev, { ...dados, id: gerarId("empresa") }]),
      criarCentro: (dados) => setCentros((prev) => [...prev, { ...dados, id: gerarId("cd") }]),
      criarArmazem: (dados) => setArmazens((prev) => [...prev, { ...dados, id: gerarId("armazem") }]),
      criarZona: (dados) => setZonas((prev) => [...prev, { ...dados, id: gerarId("zona") }]),
      criarArea: (dados) => setAreas((prev) => [...prev, { ...dados, id: gerarId("area") }]),
      criarEndereco: (dados) => setEnderecos((prev) => [...prev, { ...dados, id: gerarId("endereco") }]),
    }),
    [empresas, centros, armazens, zonas, areas, enderecos]
  );

  const produtosRepo: RepositorioProdutos = useMemo(
    () => ({
      produtos,
      criarProduto: (dados) => setProdutos((prev) => [...prev, { ...dados, id: gerarId("produto") }]),
    }),
    [produtos]
  );

  return (
    <EstruturaContext.Provider value={estrutura}>
      <ProdutosContext.Provider value={produtosRepo}>{children}</ProdutosContext.Provider>
    </EstruturaContext.Provider>
  );
}

export function useEstrutura(): RepositorioEstrutura {
  const ctx = useContext(EstruturaContext);
  if (!ctx) throw new Error("useEstrutura deve ser usado dentro de um DataStoreProvider");
  return ctx;
}

export function useProdutos(): RepositorioProdutos {
  const ctx = useContext(ProdutosContext);
  if (!ctx) throw new Error("useProdutos deve ser usado dentro de um DataStoreProvider");
  return ctx;
}
