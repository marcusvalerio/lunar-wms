"use client";

import { useState } from "react";
import { useEstrutura, useProdutos } from "@/data/store";
import { useEstoque } from "@/data/inventory-store";
import { useTarefas } from "@/data/task-store";
import { Button, TextField } from "@/components/ui";
import { EmptyState } from "@/components/EmptyState";

const PESO_PRIORIDADE: Record<string, number> = { critica: 0, alta: 1, normal: 2, baixa: 3 };

/**
 * Experiência Operacional de Picking (item 20 do spec).
 *
 *   TAREFA ATIVA → PEDIDO/PRODUTO/LOCAL/QUANTIDADE → CONFIRMAR → PRÓXIMA TAREFA
 *
 * Sem dashboard, sem navegação — o operador só vê o que precisa fazer agora.
 */
export function OperationalPicking() {
  const { produtos } = useProdutos();
  const { enderecos } = useEstrutura();
  const { tarefas, podeIniciar, iniciarTarefa, concluirTarefa } = useTarefas();
  const { confirmarPicking } = useEstoque();
  const [operador, setOperador] = useState("");
  const [ultimaConfirmacao, setUltimaConfirmacao] = useState<string | null>(null);

  const tarefasDePicking = tarefas
    .filter((t) => t.tipo === "picking" && (t.status === "disponivel" || t.status === "em_execucao"))
    .sort((a, b) => PESO_PRIORIDADE[a.prioridade] - PESO_PRIORIDADE[b.prioridade]);

  const tarefaAtiva = tarefasDePicking.find((t) => t.status === "em_execucao") ?? tarefasDePicking[0];

  if (!operador.trim()) {
    return (
      <div className="flex max-w-sm flex-col gap-3">
        <p className="type-label text-steel">Identificação</p>
        <TextField label="Operador" value={operador} onChange={(e) => setOperador(e.target.value)} placeholder="Seu nome" autoFocus />
      </div>
    );
  }

  if (!tarefaAtiva) {
    return <EmptyState titulo="Nenhuma tarefa pendente" descricao="Todas as tarefas de picking disponíveis foram processadas." />;
  }

  const nomeProduto = produtos.find((p) => p.id === tarefaAtiva.produtoId)?.sku ?? tarefaAtiva.produtoId ?? "—";
  const codigoEndereco = enderecos.find((e) => e.id === tarefaAtiva.enderecoOrigemId)?.codigo ?? tarefaAtiva.enderecoOrigemId ?? "—";

  function confirmar() {
    if (!tarefaAtiva) return;
    if (tarefaAtiva.posicaoEstoqueId && tarefaAtiva.quantidade) {
      confirmarPicking(tarefaAtiva.posicaoEstoqueId, tarefaAtiva.quantidade);
    }
    concluirTarefa(tarefaAtiva.id);
    setUltimaConfirmacao(`${nomeProduto} — ${tarefaAtiva.quantidade} un.`);
  }

  return (
    <div className="flex max-w-sm flex-col gap-6">
      {ultimaConfirmacao && (
        <p className="type-body-small rounded-md bg-green/10 px-3 py-2 text-green">✓ Tarefa concluída — {ultimaConfirmacao}</p>
      )}

      <div>
        <p className="type-label text-steel">Tarefa ativa</p>
        <p className="type-caption mt-1 text-steel">Operador: {operador}</p>
      </div>

      <div className="flex flex-col gap-4 rounded-lg border border-mist p-5">
        <div>
          <p className="type-label text-steel">Produto</p>
          <p className="type-data mt-1">{nomeProduto}</p>
        </div>
        <div>
          <p className="type-label text-steel">Localização</p>
          <p className="type-data mt-1">{codigoEndereco}</p>
        </div>
        <div>
          <p className="type-label text-steel">Quantidade</p>
          <p className="type-data mt-1">{tarefaAtiva.quantidade ?? "—"} un.</p>
        </div>
      </div>

      {tarefaAtiva.status === "disponivel" ? (
        <Button
          disabled={!podeIniciar(tarefaAtiva.id)}
          onClick={() => iniciarTarefa(tarefaAtiva.id, operador)}
          className="w-full py-4 text-center"
        >
          Iniciar
        </Button>
      ) : (
        <Button onClick={confirmar} className="w-full py-4 text-center">
          Confirmar
        </Button>
      )}

      <p className="type-caption text-center text-steel">{tarefasDePicking.length - 1} tarefa(s) na fila após esta.</p>
    </div>
  );
}
