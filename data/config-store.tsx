"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { EstrategiaAlocacao } from "@/domain/pedido";
import { configuracaoPadrao, type ConfiguracaoOperacional } from "@/domain/configuracao";

interface RepositorioConfiguracao {
  configuracao: ConfiguracaoOperacional;
  definirEstrategiaPadrao(estrategia: EstrategiaAlocacao): void;
}

const ConfigContext = createContext<RepositorioConfiguracao | null>(null);

export function ConfigStoreProvider({ children }: { children: ReactNode }) {
  const [configuracao, setConfiguracao] = useState<ConfiguracaoOperacional>(configuracaoPadrao);

  function definirEstrategiaPadrao(estrategia: EstrategiaAlocacao) {
    setConfiguracao((prev) => ({ ...prev, estrategiaAlocacaoPadrao: estrategia }));
  }

  return <ConfigContext.Provider value={{ configuracao, definirEstrategiaPadrao }}>{children}</ConfigContext.Provider>;
}

export function useConfiguracao(): RepositorioConfiguracao {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error("useConfiguracao deve ser usado dentro de um ConfigStoreProvider");
  return ctx;
}
