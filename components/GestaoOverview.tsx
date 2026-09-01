"use client";

import { usePedidos } from "@/data/order-store";
import { useEstoque } from "@/data/inventory-store";
import { useTarefas } from "@/data/task-store";
import { useRecebimento } from "@/data/receiving-store";
import { useContagem } from "@/data/counting-store";
import { useDevolucao } from "@/data/returns-store";
import { EmptyState } from "@/components/EmptyState";
import { rotuloTipoTarefa } from "@/domain/tarefa-labels";
import type { StatusPedido } from "@/domain/pedido";
import type { TipoTarefa } from "@/domain/tarefa";

const FUNIL_STATUS: StatusPedido[] = [
  "recebido",
  "analise",
  "reservado",
  "alocado",
  "picking",
  "conferencia",
  "packing",
  "expedicao",
  "concluido",
];

const TIPOS_TAREFA: TipoTarefa[] = [
  "recebimento",
  "putaway",
  "reabastecimento",
  "picking",
  "packing",
  "inventario",
  "transferencia",
  "expedicao",
  "devolucao",
];

const rotuloStatusPedidoCurto: Record<StatusPedido, string> = {
  recebido: "Recebido",
  analise: "Análise",
  reservado: "Reservado",
  alocado: "Alocado",
  planejado: "Planejado",
  picking: "Picking",
  conferencia: "Conferência",
  packing: "Packing",
  expedicao: "Expedição",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

/**
 * Experiência de Gestão — "Como minha operação está performando?"
 * (item 38 do spec). Composição em camadas (item 48), não [Card][Card][Card].
 */
export function GestaoOverview() {
  const { pedidos } = usePedidos();
  const { posicoes } = useEstoque();
  const { tarefas } = useTarefas();
  const { documentos } = useRecebimento();
  const { contagens } = useContagem();
  const { devolucoes } = useDevolucao();

  const semDadosAinda = pedidos.length === 0 && posicoes.length === 0 && tarefas.length === 0;
  if (semDadosAinda) {
    return <EmptyState titulo="Nenhum dado operacional ainda" descricao="Assim que pedidos, estoque e tarefas existirem, a visão de gestão aparece aqui." />;
  }

  const pedidosValidos = pedidos.filter((p) => p.status !== "cancelado");
  const pedidosConcluidos = pedidosValidos.filter((p) => p.status === "concluido").length;
  const percentualConcluido = pedidosValidos.length > 0 ? Math.round((pedidosConcluidos / pedidosValidos.length) * 100) : 0;

  const fisicoTotal = posicoes.reduce((s, p) => s + p.quantidade, 0);
  const bloqueado = posicoes.filter((p) => p.status !== "disponivel").reduce((s, p) => s + p.quantidade, 0);

  const tarefasBloqueadas = tarefas.filter((t) => t.status === "bloqueada").length;
  const contagensDivergentes = contagens.filter((c) => c.status === "divergente" || c.status === "aguardando_aprovacao").length;
  const devolucoesPendentes = devolucoes.filter((d) => d.status !== "concluida").length;
  const recebimentosAbertos = documentos.filter((d) => d.status !== "concluido").length;
  const pedidosParciais = pedidosValidos.filter((p) => p.status === "reservado").length;

  return (
    <div className="flex max-w-4xl flex-col gap-8">
      <div>
        <p className="type-label text-steel">Visão geral da operação</p>
        <h1 className="type-h1 mt-1 text-navy">Gestão</h1>
      </div>

      <div className="rounded-lg border border-mist p-6">
        <p className="type-label text-steel">Pedidos concluídos</p>
        <p className="type-display mt-1 text-navy">{percentualConcluido}%</p>
        <p className="type-body-small mt-1 text-steel">
          {pedidosConcluidos} de {pedidosValidos.length} pedido(s) não cancelado(s)
        </p>
      </div>

      <section className="flex flex-col gap-2">
        <p className="type-label text-steel">Funil de pedidos</p>
        <div className="flex flex-col gap-2">
          {FUNIL_STATUS.map((status) => {
            const quantidade = pedidosValidos.filter((p) => p.status === status).length;
            if (quantidade === 0) return null;
            return <BarraContagem key={status} rotulo={rotuloStatusPedidoCurto[status]} valor={quantidade} maximo={pedidosValidos.length} />;
          })}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <p className="type-label text-steel">Estoque</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Metrica rotulo="Posições" valor={posicoes.length} />
          <Metrica rotulo="Unidades físicas" valor={fisicoTotal} />
          <Metrica rotulo="Unidades bloqueadas/quarentena" valor={bloqueado} destaque={bloqueado > 0} />
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <p className="type-label text-steel">Produtividade por tipo de tarefa</p>
        <div className="flex flex-col gap-2">
          {TIPOS_TAREFA.map((tipo) => {
            const doTipo = tarefas.filter((t) => t.tipo === tipo);
            if (doTipo.length === 0) return null;
            const concluidas = doTipo.filter((t) => t.status === "concluida").length;
            return <BarraContagem key={tipo} rotulo={rotuloTipoTarefa[tipo]} valor={concluidas} maximo={doTipo.length} sufixo={`${concluidas}/${doTipo.length}`} />;
          })}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <p className="type-label text-steel">Exceções e pendências</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Metrica rotulo="Tarefas bloqueadas" valor={tarefasBloqueadas} destaque={tarefasBloqueadas > 0} />
          <Metrica rotulo="Contagens divergentes" valor={contagensDivergentes} destaque={contagensDivergentes > 0} />
          <Metrica rotulo="Devoluções pendentes" valor={devolucoesPendentes} destaque={devolucoesPendentes > 0} />
          <Metrica rotulo="Recebimentos abertos" valor={recebimentosAbertos} />
        </div>
      </section>

      {pedidosParciais > 0 && (
        <section className="flex flex-col gap-2">
          <p className="type-label text-steel">Requer decisão</p>
          <p className="type-body-small rounded-md border border-mist px-3 py-2">
            {pedidosParciais} pedido(s) com atendimento parcial (reservado, mas não totalmente alocado) — considere repor estoque ou ajustar prioridade.
          </p>
        </section>
      )}
    </div>
  );
}

function Metrica({ rotulo, valor, destaque }: { rotulo: string; valor: number; destaque?: boolean }) {
  return (
    <div className="rounded-lg border border-mist p-4">
      <p className="type-label text-steel">{rotulo}</p>
      <p className={`type-data mt-1 ${destaque ? "text-amber" : ""}`}>{valor}</p>
    </div>
  );
}

function BarraContagem({ rotulo, valor, maximo, sufixo }: { rotulo: string; valor: number; maximo: number; sufixo?: string }) {
  const percentual = maximo > 0 ? Math.round((valor / maximo) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="type-body-small w-40 shrink-0">{rotulo}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-mist">
        <div className="h-full rounded-full bg-navy" style={{ width: `${percentual}%` }} />
      </div>
      <span className="type-caption w-16 shrink-0 text-right text-steel">{sufixo ?? valor}</span>
    </div>
  );
}
