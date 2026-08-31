"use client";

import { useState } from "react";
import { useEstrutura, useProdutos } from "@/data/store";
import { useTarefas } from "@/data/task-store";
import { Button, TextField, SelectField } from "@/components/ui";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import type { TipoTarefa, PrioridadeTarefa, TipoExcecao } from "@/domain/tarefa";
import {
  rotuloTipoTarefa,
  rotuloStatusTarefa,
  statusTarefaParaBadge,
  rotuloPrioridadeTarefa,
  rotuloTipoExcecao,
} from "@/domain/tarefa-labels";

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
const PRIORIDADES: PrioridadeTarefa[] = ["critica", "alta", "normal", "baixa"];
const TIPOS_EXCECAO: TipoExcecao[] = [
  "produto_ausente",
  "codigo_incorreto",
  "estoque_insuficiente",
  "produto_avariado",
  "endereco_bloqueado",
  "divergencia_quantidade",
  "tarefa_atrasada",
  "divergencia_packing",
  "divergencia_inventario",
];

export default function TarefasPage() {
  const { produtos } = useProdutos();
  const { enderecos } = useEstrutura();
  const { tarefas, criarTarefa, podeIniciar, iniciarTarefa, concluirTarefa, reportarExcecao, resolverExcecao, cancelarTarefa } =
    useTarefas();

  const nomeProduto = (id?: string) => (id ? produtos.find((p) => p.id === id)?.sku ?? id : "—");
  const codigoEndereco = (id?: string) => (id ? enderecos.find((e) => e.id === id)?.codigo ?? id : "—");

  const ordenadas = [...tarefas].sort((a, b) => {
    const pesoPrioridade: Record<PrioridadeTarefa, number> = { critica: 0, alta: 1, normal: 2, baixa: 3 };
    return pesoPrioridade[a.prioridade] - pesoPrioridade[b.prioridade];
  });

  return (
    <div className="flex max-w-5xl flex-col gap-10">
      <div>
        <p className="type-label text-steel">Administração · Tarefas</p>
        <h1 className="type-h1 mt-1 text-navy">Motor de Tarefas</h1>
        <p className="type-body mt-2 text-steel">
          O sistema nervoso operacional do LUNAR. Tudo que acontece no armazém pode ser representado como tarefa.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="type-h2">Nova tarefa</h2>
        <FormularioTarefa
          produtos={produtos}
          enderecos={enderecos}
          tarefasDisponiveis={tarefas.filter((t) => t.status !== "concluida" && t.status !== "cancelada")}
          onCriar={criarTarefa}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="type-h2">Tarefas</h2>
        {ordenadas.length === 0 ? (
          <EmptyState titulo="Nenhuma tarefa disponível" descricao="Todas as tarefas disponíveis foram processadas." />
        ) : (
          <div className="flex flex-col gap-3">
            {ordenadas.map((tarefa) => (
              <div key={tarefa.id} className="rounded-lg border border-mist p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="type-h3">{rotuloTipoTarefa[tarefa.tipo]}</p>
                    <StatusBadge status={statusTarefaParaBadge(tarefa.status)} />
                    <span className="type-metadata text-steel">{rotuloStatusTarefa[tarefa.status]}</span>
                    <span className="type-caption text-steel">Prioridade: {rotuloPrioridadeTarefa[tarefa.prioridade]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {tarefa.status === "disponivel" && (
                      <AcaoIniciar tarefaId={tarefa.id} podeIniciar={podeIniciar(tarefa.id)} onIniciar={iniciarTarefa} />
                    )}
                    {tarefa.status === "em_execucao" && <Button onClick={() => concluirTarefa(tarefa.id)}>Concluir</Button>}
                    {(tarefa.status === "disponivel" || tarefa.status === "em_execucao") && (
                      <AcaoExcecao tarefaId={tarefa.id} onReportar={reportarExcecao} />
                    )}
                    {tarefa.status === "bloqueada" && (
                      <Button variant="secondary" onClick={() => resolverExcecao(tarefa.id)}>
                        Resolver exceção
                      </Button>
                    )}
                    {tarefa.status !== "concluida" && tarefa.status !== "cancelada" && (
                      <Button variant="secondary" onClick={() => cancelarTarefa(tarefa.id)}>
                        Cancelar
                      </Button>
                    )}
                  </div>
                </div>

                <div className="type-body-small mt-3 flex flex-wrap gap-x-6 gap-y-1 text-steel">
                  {tarefa.produtoId && <span>Produto: {nomeProduto(tarefa.produtoId)}</span>}
                  {tarefa.quantidade !== undefined && <span>Quantidade: {tarefa.quantidade}</span>}
                  {tarefa.enderecoOrigemId && <span>Origem: {codigoEndereco(tarefa.enderecoOrigemId)}</span>}
                  {tarefa.enderecoDestinoId && <span>Destino: {codigoEndereco(tarefa.enderecoDestinoId)}</span>}
                  {tarefa.operadorId && <span>Operador: {tarefa.operadorId}</span>}
                </div>

                {tarefa.dependeDe && tarefa.dependeDe.length > 0 && (
                  <p className="type-caption mt-2 text-steel">
                    Depende de {tarefa.dependeDe.length} tarefa(s)
                    {tarefa.status === "disponivel" && !podeIniciar(tarefa.id) ? " — ainda não concluída(s)" : ""}.
                  </p>
                )}

                {tarefa.excecao && (
                  <p className="type-body-small mt-2 rounded-md bg-stone px-3 py-2 text-ink">
                    {rotuloTipoExcecao[tarefa.excecao.tipo]}: {tarefa.excecao.descricao}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function AcaoIniciar({
  tarefaId,
  podeIniciar,
  onIniciar,
}: {
  tarefaId: string;
  podeIniciar: boolean;
  onIniciar: (id: string, operadorId: string) => void;
}) {
  const [operador, setOperador] = useState("");
  return (
    <div className="flex items-end gap-2">
      <TextField label="Operador" value={operador} onChange={(e) => setOperador(e.target.value)} placeholder="Nome" />
      <Button disabled={!podeIniciar || !operador.trim()} onClick={() => onIniciar(tarefaId, operador)}>
        Iniciar
      </Button>
    </div>
  );
}

function AcaoExcecao({ tarefaId, onReportar }: { tarefaId: string; onReportar: (id: string, tipo: TipoExcecao, descricao: string) => void }) {
  const [aberto, setAberto] = useState(false);
  const [tipo, setTipo] = useState<TipoExcecao>("produto_ausente");
  const [descricao, setDescricao] = useState("");

  if (!aberto) {
    return (
      <Button variant="secondary" onClick={() => setAberto(true)}>
        Reportar exceção
      </Button>
    );
  }

  return (
    <div className="flex items-end gap-2">
      <SelectField label="Tipo" value={tipo} onChange={(e) => setTipo(e.target.value as TipoExcecao)}>
        {TIPOS_EXCECAO.map((t) => (
          <option key={t} value={t}>
            {rotuloTipoExcecao[t]}
          </option>
        ))}
      </SelectField>
      <TextField label="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="O que aconteceu" />
      <Button
        onClick={() => {
          if (!descricao.trim()) return;
          onReportar(tarefaId, tipo, descricao);
          setAberto(false);
          setDescricao("");
        }}
      >
        Confirmar
      </Button>
    </div>
  );
}

function FormularioTarefa({
  produtos,
  enderecos,
  tarefasDisponiveis,
  onCriar,
}: {
  produtos: { id: string; sku: string }[];
  enderecos: { id: string; codigo: string }[];
  tarefasDisponiveis: { id: string; tipo: TipoTarefa }[];
  onCriar: (dados: {
    tipo: TipoTarefa;
    prioridade: PrioridadeTarefa;
    produtoId?: string;
    quantidade?: number;
    enderecoOrigemId?: string;
    enderecoDestinoId?: string;
    dependeDe?: string[];
  }) => void;
}) {
  const [tipo, setTipo] = useState<TipoTarefa>("picking");
  const [prioridade, setPrioridade] = useState<PrioridadeTarefa>("normal");
  const [produtoId, setProdutoId] = useState("");
  const [quantidade, setQuantidade] = useState(0);
  const [enderecoOrigemId, setEnderecoOrigemId] = useState("");
  const [enderecoDestinoId, setEnderecoDestinoId] = useState("");
  const [dependencia, setDependencia] = useState("");

  return (
    <form
      className="flex flex-col gap-4 rounded-lg border border-mist p-4"
      onSubmit={(e) => {
        e.preventDefault();
        onCriar({
          tipo,
          prioridade,
          produtoId: produtoId || undefined,
          quantidade: quantidade || undefined,
          enderecoOrigemId: enderecoOrigemId || undefined,
          enderecoDestinoId: enderecoDestinoId || undefined,
          dependeDe: dependencia ? [dependencia] : undefined,
        });
        setQuantidade(0);
      }}
    >
      <div className="flex flex-wrap items-end gap-4">
        <SelectField label="Tipo" value={tipo} onChange={(e) => setTipo(e.target.value as TipoTarefa)}>
          {TIPOS.map((t) => (
            <option key={t} value={t}>
              {rotuloTipoTarefa[t]}
            </option>
          ))}
        </SelectField>
        <SelectField label="Prioridade" value={prioridade} onChange={(e) => setPrioridade(e.target.value as PrioridadeTarefa)}>
          {PRIORIDADES.map((p) => (
            <option key={p} value={p}>
              {rotuloPrioridadeTarefa[p]}
            </option>
          ))}
        </SelectField>
        {produtos.length > 0 && (
          <SelectField label="Produto (opcional)" value={produtoId} onChange={(e) => setProdutoId(e.target.value)}>
            <option value="">—</option>
            {produtos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.sku}
              </option>
            ))}
          </SelectField>
        )}
        <TextField label="Quantidade" type="number" min={0} value={quantidade || ""} onChange={(e) => setQuantidade(Number(e.target.value))} />
      </div>

      {enderecos.length > 0 && (
        <div className="flex flex-wrap items-end gap-4">
          <SelectField label="Endereço origem (opcional)" value={enderecoOrigemId} onChange={(e) => setEnderecoOrigemId(e.target.value)}>
            <option value="">—</option>
            {enderecos.map((e) => (
              <option key={e.id} value={e.id}>
                {e.codigo}
              </option>
            ))}
          </SelectField>
          <SelectField label="Endereço destino (opcional)" value={enderecoDestinoId} onChange={(e) => setEnderecoDestinoId(e.target.value)}>
            <option value="">—</option>
            {enderecos.map((e) => (
              <option key={e.id} value={e.id}>
                {e.codigo}
              </option>
            ))}
          </SelectField>
        </div>
      )}

      {tarefasDisponiveis.length > 0 && (
        <SelectField label="Depende de (opcional)" value={dependencia} onChange={(e) => setDependencia(e.target.value)}>
          <option value="">—</option>
          {tarefasDisponiveis.map((t) => (
            <option key={t.id} value={t.id}>
              {rotuloTipoTarefa[t.tipo]} ({t.id.slice(-6)})
            </option>
          ))}
        </SelectField>
      )}

      <div>
        <Button type="submit">Criar tarefa</Button>
      </div>
    </form>
  );
}
