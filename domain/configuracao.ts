import type { EstrategiaAlocacao } from "./pedido";

export interface ConfiguracaoOperacional {
  estrategiaAlocacaoPadrao: EstrategiaAlocacao;
}

export const configuracaoPadrao: ConfiguracaoOperacional = {
  estrategiaAlocacaoPadrao: "FEFO",
};
