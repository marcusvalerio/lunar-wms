"use client";

import { useState } from "react";
import { useEstrutura, useProdutos } from "@/data/store";
import { useEstoque } from "@/data/inventory-store";
import { useTarefas } from "@/data/task-store";
import { Button, TextField, SelectField } from "@/components/ui";
import { EmptyState } from "@/components/EmptyState";
import { rotuloTipoTarefa } from "@/domain/tarefa-labels";
import type { TipoTarefa } from "@/domain/tarefa";

const TIPOS: TipoTarefa[] = [
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

/**
 * Experiência Tática — "Como devo organizar a operação?" (item 39 do
 * spec). Foco em reabastecimento (item 18) e carga de trabalho.
 */
export function TacticalPlanning() {
  const { produtos } = useProdutos();
  const { zonas, areas, enderecos } = useEstrutura();
  const { posicoes, transferirEstoque } = useEstoque();
  const { tarefas, criarTarefa, concluirTarefa } = useTarefas();
  const [limiar, setLimiar] = useState(5);

  const nomeProduto = (id?: string) => (id ? produtos.find((p) => p.id === id)?.sku ?? id : "—");
  const codigoEndereco = (id: string) => enderecos.find((e) => e.id === id)?.codigo ?? id;

  function ehLocalDePicking(enderecoId: string): boolean {
    const endereco = enderecos.find((e) => e.id === enderecoId);
    const area = areas.find((a) => a.id === endereco?.areaId);
    const zona = zonas.find((z) => z.id === area?.zonaId);
    return zona?.tipo === "picking";
  }

  const posicoesDePickingBaixas = posicoes.filter((p) => ehLocalDePicking(p.enderecoId) && p.quantidade < limiar);

  function fontesDisponiveis(produtoId: string, enderecoPickingId: string) {
    return posicoes.filter((p) => p.produtoId === produtoId && p.enderecoId !== enderecoPickingId && p.quantidade > 0);
  }

  function criarReabastecimento(posicaoOrigemId: string, enderecoDestinoId: string, produtoId: string, quantidade: number) {
    criarTarefa({
      tipo: "reabastecimento",
      prioridade: "normal",
      produtoId,
      quantidade,
      enderecoOrigemId: enderecos.find((e) => e.id === posicoes.find((p) => p.id === posicaoOrigemId)?.enderecoId)?.id,
      enderecoDestinoId,
      posicaoEstoqueId: posicaoOrigemId,
    });
  }

  const tarefasReabastecimentoAtivas = tarefas.filter((t) => t.tipo === "reabastecimento" && t.status !== "concluida" && t.status !== "cancelada");

  function concluirReabastecimento(tarefaId: string) {
    const tarefa = tarefas.find((t) => t.id === tarefaId);
    if (!tarefa || !tarefa.posicaoEstoqueId || !tarefa.enderecoDestinoId || !tarefa.quantidade) return;
    transferirEstoque(tarefa.posicaoEstoqueId, tarefa.enderecoDestinoId, tarefa.quantidade);
    concluirTarefa(tarefaId);
  }

  return (
    <div className="flex max-w-4xl flex-col gap-8">
      <div>
        <p className="type-label text-steel">Planejamento</p>
        <h1 className="type-h1 mt-1 text-navy">Tático</h1>
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-end justify-between gap-3">
          <p className="type-label text-steel">Reabastecimento — posições de picking abaixo do limiar</p>
          <TextField label="Limiar" type="number" min={1} value={limiar} onChange={(e) => setLimiar(Number(e.target.value) || 1)} />
        </div>

        {posicoesDePickingBaixas.length === 0 ? (
          <EmptyState titulo="Nenhuma posição de picking abaixo do limiar" descricao="Todas as posições de picking têm estoque acima do limiar definido." />
        ) : (
          <div className="flex flex-col gap-2">
            {posicoesDePickingBaixas.map((p) => (
              <LinhaReabastecimento
                key={p.id}
                nomeProduto={nomeProduto(p.produtoId)}
                enderecoDestino={codigoEndereco(p.enderecoId)}
                quantidadeAtual={p.quantidade}
                fontes={fontesDisponiveis(p.produtoId, p.enderecoId).map((f) => ({ id: f.id, rotulo: codigoEndereco(f.enderecoId), disponivel: f.quantidade }))}
                onCriarTarefa={(posicaoOrigemId, quantidade) => criarReabastecimento(posicaoOrigemId, p.enderecoId, p.produtoId, quantidade)}
              />
            ))}
          </div>
        )}
      </section>

      {tarefasReabastecimentoAtivas.length > 0 && (
        <section className="flex flex-col gap-2">
          <p className="type-label text-steel">Reabastecimentos em andamento</p>
          {tarefasReabastecimentoAtivas.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-md border border-mist px-3 py-2">
              <span className="type-body-small">
                {nomeProduto(t.produtoId)} — {t.quantidade} un. → {codigoEndereco(t.enderecoDestinoId ?? "")}
              </span>
              <Button variant="secondary" onClick={() => concluirReabastecimento(t.id)}>
                Confirmar transferência
              </Button>
            </div>
          ))}
        </section>
      )}

      <section className="flex flex-col gap-2">
        <p className="type-label text-steel">Carga de trabalho pendente por tipo</p>
        <div className="flex flex-col divide-y divide-mist rounded-lg border border-mist">
          {TIPOS.map((tipo) => {
            const pendentes = tarefas.filter((t) => t.tipo === tipo && t.status === "disponivel").length;
            if (pendentes === 0) return null;
            return (
              <div key={tipo} className="flex items-center justify-between px-4 py-3">
                <span className="type-body-small">{rotuloTipoTarefa[tipo]}</span>
                <span className="type-data">{pendentes}</span>
              </div>
            );
          })}
          {tarefas.filter((t) => t.status === "disponivel").length === 0 && (
            <p className="type-body-small px-4 py-3 text-steel">Nenhuma tarefa pendente no momento.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function LinhaReabastecimento({
  nomeProduto,
  enderecoDestino,
  quantidadeAtual,
  fontes,
  onCriarTarefa,
}: {
  nomeProduto: string;
  enderecoDestino: string;
  quantidadeAtual: number;
  fontes: { id: string; rotulo: string; disponivel: number }[];
  onCriarTarefa: (posicaoOrigemId: string, quantidade: number) => void;
}) {
  const [origemId, setOrigemId] = useState(fontes[0]?.id ?? "");
  const [quantidade, setQuantidade] = useState(0);

  return (
    <div className="rounded-md border border-mist p-3">
      <p className="type-body-small">
        {nomeProduto} em {enderecoDestino} — {quantidadeAtual} un.
      </p>
      {fontes.length === 0 ? (
        <p className="type-caption mt-1 text-steel">Nenhuma outra posição com estoque deste produto.</p>
      ) : (
        <form
          className="mt-2 flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!origemId || quantidade <= 0) return;
            onCriarTarefa(origemId, quantidade);
            setQuantidade(0);
          }}
        >
          <SelectField label="Origem" value={origemId} onChange={(e) => setOrigemId(e.target.value)}>
            {fontes.map((f) => (
              <option key={f.id} value={f.id}>
                {f.rotulo} ({f.disponivel} un.)
              </option>
            ))}
          </SelectField>
          <TextField label="Quantidade" type="number" min={1} value={quantidade || ""} onChange={(e) => setQuantidade(Number(e.target.value))} />
          <Button type="submit" variant="secondary">
            Criar tarefa de reabastecimento
          </Button>
        </form>
      )}
    </div>
  );
}
