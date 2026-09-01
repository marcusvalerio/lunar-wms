"use client";

import { useEffect, useState } from "react";
import { useTarefas } from "@/data/task-store";
import { useProdutos } from "@/data/store";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui";
import { rotuloTipoTarefa, rotuloTipoExcecao } from "@/domain/tarefa-labels";
import type { Tarefa, TipoTarefa } from "@/domain/tarefa";

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

/** Acima deste tempo em aberto, uma tarefa é considerada atrasada. Sem SLA configurável ainda — limiar fixo e explícito. */
const LIMIAR_ATRASO_MINUTOS = 15;

function estaAtrasada(tarefa: Tarefa, agora: number): boolean {
  if (tarefa.status !== "disponivel" && tarefa.status !== "em_execucao") return false;
  const minutosAberta = (agora - new Date(tarefa.criadaEm).getTime()) / 60000;
  return minutosAberta > LIMIAR_ATRASO_MINUTOS;
}

/**
 * Experiência de Supervisão — "Onde a operação precisa de mim agora?"
 * (item 35 do spec). Foco em intervenção, não em navegação.
 */
export function SupervisionControlTower() {
  const { tarefas, resolverExcecao } = useTarefas();
  const { produtos } = useProdutos();
  const [agora, setAgora] = useState<number>(() => Date.now());

  useEffect(() => {
    const intervalo = setInterval(() => setAgora(Date.now()), 30_000);
    return () => clearInterval(intervalo);
  }, []);

  if (tarefas.length === 0) {
    return <EmptyState titulo="Nenhuma tarefa na operação" descricao="Assim que tarefas forem criadas (recebimento, picking, packing...), elas aparecem aqui." />;
  }

  const emExecucao = tarefas.filter((t) => t.status === "em_execucao");
  const disponiveis = tarefas.filter((t) => t.status === "disponivel");
  const atrasadas = tarefas.filter((t) => estaAtrasada(t, agora));
  const bloqueadas = tarefas.filter((t) => t.status === "bloqueada");
  const operadoresAtivos = Array.from(new Set(emExecucao.map((t) => t.operadorId).filter(Boolean))) as string[];

  const nomeProduto = (id?: string) => (id ? produtos.find((p) => p.id === id)?.sku ?? id : "—");

  return (
    <div className="flex max-w-4xl flex-col gap-8">
      <div>
        <p className="type-label text-steel">Operação agora</p>
        <h1 className="type-h1 mt-1 text-navy">Torre de controle</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Sinal rotulo="Em execução" valor={emExecucao.length} />
        <Sinal rotulo="Pendentes" valor={disponiveis.length} />
        <Sinal rotulo="Atrasadas" valor={atrasadas.length} destaque={atrasadas.length > 0} />
        <Sinal rotulo="Bloqueadas" valor={bloqueadas.length} destaque={bloqueadas.length > 0} />
      </div>

      <section className="flex flex-col gap-2">
        <p className="type-label text-steel">Por tipo de tarefa</p>
        <div className="flex flex-col divide-y divide-mist rounded-lg border border-mist">
          {TIPOS.map((tipo) => {
            const doTipo = tarefas.filter((t) => t.tipo === tipo);
            if (doTipo.length === 0) return null;
            const concluidas = doTipo.filter((t) => t.status === "concluida").length;
            const percentual = Math.round((concluidas / doTipo.length) * 100);
            const atrasadasDoTipo = doTipo.filter((t) => estaAtrasada(t, agora)).length;
            return (
              <div key={tipo} className="flex items-center justify-between px-4 py-3">
                <span className="type-body-small">{rotuloTipoTarefa[tipo]}</span>
                <div className="flex items-center gap-4">
                  <span className="type-data">{percentual}%</span>
                  <span className="type-caption text-steel">{doTipo.length} tarefa(s)</span>
                  {atrasadasDoTipo > 0 && <span className="type-caption text-red">{atrasadasDoTipo} atrasada(s)</span>}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <p className="type-label text-steel">Operadores ativos</p>
        {operadoresAtivos.length === 0 ? (
          <p className="type-body-small text-steel">Nenhum operador com tarefa em execução no momento.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {operadoresAtivos.map((operador) => {
              const tarefaDoOperador = emExecucao.find((t) => t.operadorId === operador);
              return (
                <div key={operador} className="flex items-center justify-between rounded-md bg-stone px-3 py-2">
                  <span className="type-body-small">{operador}</span>
                  <span className="type-caption text-steel">
                    {tarefaDoOperador ? `${rotuloTipoTarefa[tarefaDoOperador.tipo]} — ${nomeProduto(tarefaDoOperador.produtoId)}` : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <p className="type-label text-steel">Exceções — requerem intervenção</p>
        {bloqueadas.length === 0 ? (
          <p className="type-body-small text-steel">Nenhuma exceção em aberto.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {bloqueadas.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-md border border-mist px-3 py-2">
                <div>
                  <p className="type-body-small">{rotuloTipoTarefa[t.tipo]} — {nomeProduto(t.produtoId)}</p>
                  {t.excecao && <p className="type-caption text-steel">{rotuloTipoExcecao[t.excecao.tipo]}: {t.excecao.descricao}</p>}
                </div>
                <Button variant="secondary" onClick={() => resolverExcecao(t.id)}>
                  Resolver
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Sinal({ rotulo, valor, destaque }: { rotulo: string; valor: number; destaque?: boolean }) {
  return (
    <div className="rounded-lg border border-mist p-4">
      <p className="type-label text-steel">{rotulo}</p>
      <p className={`type-display mt-1 ${destaque ? "text-red" : "text-navy"}`}>{valor}</p>
    </div>
  );
}
