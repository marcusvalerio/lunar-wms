/**
 * LUNAR — Alocação de Estoque
 *
 * "Qual estoque deve atender esta demanda?" — regras determinísticas
 * primeiro (item 15 do spec). Nenhuma inteligência artificial aqui.
 */

import type { EstrategiaAlocacao } from "./pedido";

export interface PosicaoAlocavel {
  posicaoId: string;
  quantidadeDisponivel: number;
  criadaEm: string; // ISO datetime — base do FIFO/LIFO
  validade?: string; // ISO date — base do FEFO
}

export interface ItemAlocado {
  posicaoId: string;
  quantidade: number;
}

export interface ResultadoAlocacao {
  alocacoes: ItemAlocado[];
  quantidadeAtendida: number;
  quantidadeNaoAtendida: number;
}

function ordenarPorEstrategia(posicoes: PosicaoAlocavel[], estrategia: EstrategiaAlocacao): PosicaoAlocavel[] {
  const copia = [...posicoes];

  if (estrategia === "FEFO") {
    // Sem validade vai por último — não é seguro presumir que não vence.
    return copia.sort((a, b) => {
      if (!a.validade && !b.validade) return 0;
      if (!a.validade) return 1;
      if (!b.validade) return -1;
      return a.validade.localeCompare(b.validade);
    });
  }

  if (estrategia === "LIFO") {
    return copia.sort((a, b) => b.criadaEm.localeCompare(a.criadaEm));
  }

  // FIFO (padrão)
  return copia.sort((a, b) => a.criadaEm.localeCompare(b.criadaEm));
}

/** Aloca greedily a partir das posições ordenadas pela estratégia escolhida. */
export function alocarEstoque(
  posicoes: PosicaoAlocavel[],
  quantidadeSolicitada: number,
  estrategia: EstrategiaAlocacao
): ResultadoAlocacao {
  const ordenadas = ordenarPorEstrategia(
    posicoes.filter((p) => p.quantidadeDisponivel > 0),
    estrategia
  );

  const alocacoes: ItemAlocado[] = [];
  let restante = quantidadeSolicitada;

  for (const posicao of ordenadas) {
    if (restante <= 0) break;
    const quantidade = Math.min(restante, posicao.quantidadeDisponivel);
    if (quantidade <= 0) continue;
    alocacoes.push({ posicaoId: posicao.posicaoId, quantidade });
    restante -= quantidade;
  }

  return {
    alocacoes,
    quantidadeAtendida: quantidadeSolicitada - restante,
    quantidadeNaoAtendida: restante,
  };
}
