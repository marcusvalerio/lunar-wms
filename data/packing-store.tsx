"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Volume } from "@/domain/volume";
import { gerarId } from "./repository";

interface RepositorioPacking {
  volumes: Volume[];

  criarVolume(pedidoId: string): void;
  adicionarItemAoVolume(volumeId: string, produtoId: string, quantidade: number): void;
  fecharVolume(volumeId: string, dados: { pesoKg: number; alturaCm: number; larguraCm: number; comprimentoCm: number }): void;
}

const PackingContext = createContext<RepositorioPacking | null>(null);

export function PackingStoreProvider({ children }: { children: ReactNode }) {
  const [volumes, setVolumes] = useState<Volume[]>([]);

  function criarVolume(pedidoId: string) {
    setVolumes((prev) => [
      ...prev,
      { id: gerarId("volume"), pedidoId, status: "montando", itens: [], criadoEm: new Date().toISOString() },
    ]);
  }

  /** MONTAR VOLUME — adicionar itens ao volume ainda em montagem. */
  function adicionarItemAoVolume(volumeId: string, produtoId: string, quantidade: number) {
    setVolumes((prev) =>
      prev.map((v) => {
        if (v.id !== volumeId || v.status !== "montando") return v;
        const existente = v.itens.find((i) => i.produtoId === produtoId);
        const itens = existente
          ? v.itens.map((i) => (i.produtoId === produtoId ? { ...i, quantidade: i.quantidade + quantidade } : i))
          : [...v.itens, { produtoId, quantidade }];
        return { ...v, itens };
      })
    );
  }

  /** FECHAR VOLUME — peso e dimensões, ação separada de montar (item 23 do spec). */
  function fecharVolume(volumeId: string, dados: { pesoKg: number; alturaCm: number; larguraCm: number; comprimentoCm: number }) {
    setVolumes((prev) =>
      prev.map((v) => (v.id === volumeId ? { ...v, status: "fechado", ...dados, fechadoEm: new Date().toISOString() } : v))
    );
  }

  const value: RepositorioPacking = { volumes, criarVolume, adicionarItemAoVolume, fecharVolume };

  return <PackingContext.Provider value={value}>{children}</PackingContext.Provider>;
}

export function usePacking(): RepositorioPacking {
  const ctx = useContext(PackingContext);
  if (!ctx) throw new Error("usePacking deve ser usado dentro de um PackingStoreProvider");
  return ctx;
}
