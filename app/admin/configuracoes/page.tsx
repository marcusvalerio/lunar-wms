"use client";

import { useConfiguracao } from "@/data/config-store";
import { SelectField } from "@/components/ui";
import type { EstrategiaAlocacao } from "@/domain/pedido";

const ESTRATEGIAS: EstrategiaAlocacao[] = ["FEFO", "FIFO", "LIFO"];

const descricaoEstrategia: Record<EstrategiaAlocacao, string> = {
  FEFO: "Prioriza o lote que vence primeiro. Recomendado para produtos perecíveis.",
  FIFO: "Prioriza o estoque que chegou primeiro.",
  LIFO: "Prioriza o estoque que chegou por último.",
};

export default function ConfiguracoesPage() {
  const { configuracao, definirEstrategiaPadrao } = useConfiguracao();

  return (
    <div className="flex max-w-3xl flex-col gap-10">
      <div>
        <p className="type-label text-steel">Administração · Configuração</p>
        <h1 className="type-h1 mt-1 text-navy">Configuração</h1>
        <p className="type-body mt-2 text-steel">Regras e estratégias que os motores operacionais usam por padrão.</p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="type-h2">Estratégia de alocação padrão</h2>
        <p className="type-body-small text-steel">
          Usada como sugestão inicial em Estoque e Pedidos ao reservar/alocar — o operador ainda pode trocar em cada operação.
        </p>
        <div className="max-w-xs">
          <SelectField
            label="Estratégia"
            value={configuracao.estrategiaAlocacaoPadrao}
            onChange={(e) => definirEstrategiaPadrao(e.target.value as EstrategiaAlocacao)}
          >
            {ESTRATEGIAS.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </SelectField>
        </div>
        <p className="type-caption text-steel">{descricaoEstrategia[configuracao.estrategiaAlocacaoPadrao]}</p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="type-h2">Experiência atual (seletor de desenvolvimento)</h2>
        <p className="type-body-small text-steel">
          O seletor de experiência no cabeçalho (Administração/Gestão/Tático/Supervisão/Operacional) é um mecanismo de
          validação de produto — <strong>não é autenticação</strong>. Ele existe para testar as cinco experiências
          hierárquicas sem precisar de login real nesta fase (ver item 7/78 do escopo do produto).
        </p>
        <p className="type-body-small text-steel">
          A arquitetura já está pronta para substituir esse seletor por <code>authenticatedUser.role</code> quando a
          autenticação real for implementada, sem reescrever as telas (ver item 8).
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="type-h2">Capacidades e segmentos</h2>
        <p className="type-body-small text-steel">
          Ainda não implementados. A arquitetura já reserva este espaço (item 41 do escopo do produto) para regras como
          controle de lote/validade/serial, rastreabilidade, temperatura, SLA e segmentação por cliente ou operação —
          nada disso é fabricado aqui até ser efetivamente construído.
        </p>
      </section>
    </div>
  );
}
