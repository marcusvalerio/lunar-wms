"use client";

import { useEstoque } from "@/data/inventory-store";
import { useTarefas } from "@/data/task-store";
import { usePedidos } from "@/data/order-store";
import { useRecebimento } from "@/data/receiving-store";
import { useDevolucao } from "@/data/returns-store";
import { useProdutos } from "@/data/store";
import { EmptyState } from "@/components/EmptyState";
import { rotuloTipoTarefa } from "@/domain/tarefa-labels";

interface EventoAtividade {
  quando: string;
  descricao: string;
  quem?: string;
}

/**
 * Trilha de atividades — Governança (item 41/75 do spec).
 * Não é um sistema de auditoria à parte: é a superfície dos timestamps
 * que cada domínio já registra (WHO/WHAT/WHEN, quando disponível).
 */
export default function AtividadesPage() {
  const { produtos } = useProdutos();
  const { movimentos } = useEstoque();
  const { tarefas } = useTarefas();
  const { pedidos } = usePedidos();
  const { documentos } = useRecebimento();
  const { devolucoes } = useDevolucao();

  const nomeProduto = (id: string) => produtos.find((p) => p.id === id)?.sku ?? id;

  const eventos: EventoAtividade[] = [
    ...movimentos.map((m) => ({
      quando: m.criadoEm,
      descricao: `Movimento de estoque (${m.tipo}) — ${nomeProduto(m.produtoId)}, ${m.quantidade} un.${m.motivo ? ` — ${m.motivo}` : ""}`,
    })),
    ...tarefas.flatMap((t) => {
      const eventosDaTarefa: EventoAtividade[] = [
        { quando: t.criadaEm, descricao: `Tarefa de ${rotuloTipoTarefa[t.tipo]} criada — ${nomeProduto(t.produtoId ?? "")}` },
      ];
      if (t.iniciadaEm) eventosDaTarefa.push({ quando: t.iniciadaEm, descricao: `Tarefa de ${rotuloTipoTarefa[t.tipo]} iniciada`, quem: t.operadorId });
      if (t.concluidaEm) eventosDaTarefa.push({ quando: t.concluidaEm, descricao: `Tarefa de ${rotuloTipoTarefa[t.tipo]} concluída`, quem: t.operadorId });
      return eventosDaTarefa;
    }),
    ...pedidos.map((p) => ({ quando: p.criadoEm, descricao: `Pedido #${p.numero} criado` })),
    ...documentos.map((d) => ({ quando: d.criadoEm, descricao: `Documento de recebimento #${d.numero} criado` })),
    ...devolucoes.map((d) => ({ quando: d.criadaEm, descricao: `Devolução #${d.numero} registrada` })),
  ].sort((a, b) => b.quando.localeCompare(a.quando));

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <p className="type-label text-steel">Administração · Governança</p>
        <h1 className="type-h1 mt-1 text-navy">Atividades</h1>
        <p className="type-body mt-2 text-steel">
          Linha do tempo de eventos operacionais e administrativos, a partir dos registros que cada motor já mantém.
        </p>
      </div>

      {eventos.length === 0 ? (
        <EmptyState titulo="Nenhuma atividade registrada ainda" descricao="Assim que a operação começar a rodar, os eventos aparecem aqui." />
      ) : (
        <div className="flex flex-col divide-y divide-mist rounded-lg border border-mist">
          {eventos.slice(0, 200).map((evento, indice) => (
            <div key={indice} className="flex items-center justify-between px-4 py-3">
              <span className="type-body-small">{evento.descricao}</span>
              <span className="type-caption whitespace-nowrap text-steel">
                {new Date(evento.quando).toLocaleString("pt-BR")}
                {evento.quem ? ` · ${evento.quem}` : ""}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
