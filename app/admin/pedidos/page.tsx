"use client";

import { useState } from "react";
import { useEstrutura, useProdutos } from "@/data/store";
import { useEstoque } from "@/data/inventory-store";
import { usePedidos } from "@/data/order-store";
import { useTarefas } from "@/data/task-store";
import { Button, TextField, SelectField } from "@/components/ui";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import type { PrioridadePedido, EstrategiaAlocacao, ItemPedido } from "@/domain/pedido";
import { rotuloStatusPedido, statusPedidoParaBadge, rotuloPrioridade } from "@/domain/pedido-labels";

const PRIORIDADES: PrioridadePedido[] = ["critica", "alta", "normal", "baixa"];
const ESTRATEGIAS: EstrategiaAlocacao[] = ["FEFO", "FIFO", "LIFO"];

export default function PedidosPage() {
  const { produtos } = useProdutos();
  const { enderecos } = useEstrutura();
  const { pedidos, criarPedido, atualizarItens, cancelarPedido } = usePedidos();
  const { reservar, posicoes } = useEstoque();
  const { criarTarefa } = useTarefas();

  const nomeProduto = (id: string) => produtos.find((p) => p.id === id)?.sku ?? id;
  const codigoEndereco = (id: string) => enderecos.find((e) => e.id === id)?.codigo ?? id;

  function processarReservaEAlocacao(pedidoId: string, estrategia: EstrategiaAlocacao) {
    const pedido = pedidos.find((p) => p.id === pedidoId);
    if (!pedido) return;

    const itensAtualizados: ItemPedido[] = pedido.itens.map((item) => {
      const resultado = reservar(item.produtoId, item.quantidadeSolicitada, estrategia);
      return {
        ...item,
        quantidadeReservada: resultado.quantidadeAtendida,
        // Nesta fase, reserva e alocação são resolvidas juntas (ver data/inventory-store.tsx)
        quantidadeAlocada: resultado.quantidadeAtendida,
        alocacoes: resultado.alocacoes,
      };
    });

    const totalmenteAtendido = itensAtualizados.every((i) => i.quantidadeAlocada >= i.quantidadeSolicitada);
    atualizarItens(pedidoId, itensAtualizados, totalmenteAtendido ? "alocado" : "reservado");
  }

  function gerarTarefasDePicking(pedidoId: string) {
    const pedido = pedidos.find((p) => p.id === pedidoId);
    if (!pedido) return;

    for (const item of pedido.itens) {
      for (const alocacao of item.alocacoes ?? []) {
        const posicao = posicoes.find((p) => p.id === alocacao.posicaoId);
        criarTarefa({
          tipo: "picking",
          prioridade: pedido.prioridade,
          produtoId: item.produtoId,
          quantidade: alocacao.quantidade,
          enderecoOrigemId: posicao?.enderecoId,
          posicaoEstoqueId: alocacao.posicaoId,
        });
      }
    }

    atualizarItens(pedidoId, pedido.itens, "picking");
  }

  return (
    <div className="flex max-w-5xl flex-col gap-10">
      <div>
        <p className="type-label text-steel">Administração · Pedidos</p>
        <h1 className="type-h1 mt-1 text-navy">Motor de Pedidos</h1>
        <p className="type-body mt-2 text-steel">
          Recebido → Análise → Reservado → Alocado → Planejado → Picking → Conferência → Packing → Expedição → Concluído.
        </p>
      </div>

      {produtos.length === 0 ? (
        <EmptyState titulo="Cadastre produtos primeiro" descricao="Um pedido precisa referenciar produtos já cadastrados (Admin › Produtos)." />
      ) : (
        <>
          <section className="flex flex-col gap-3">
            <h2 className="type-h2">Novo pedido</h2>
            <FormularioPedido produtos={produtos} onCriar={criarPedido} />
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="type-h2">Pedidos</h2>
            {pedidos.length === 0 ? (
              <EmptyState titulo="Nenhum pedido registrado" descricao="Crie o primeiro pedido para conectar demanda ao estoque." />
            ) : (
              <div className="flex flex-col gap-3">
                {pedidos.map((pedido) => (
                  <div key={pedido.id} className="rounded-lg border border-mist p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <p className="type-h3">#{pedido.numero}</p>
                        <StatusBadge status={statusPedidoParaBadge(pedido.status)} />
                        <span className="type-metadata text-steel">{rotuloStatusPedido[pedido.status]}</span>
                        <span className="type-caption text-steel">Prioridade: {rotuloPrioridade[pedido.prioridade]}</span>
                      </div>
                      {pedido.status === "recebido" || pedido.status === "analise" || pedido.status === "reservado" ? (
                        <AcaoReservar pedidoId={pedido.id} onProcessar={processarReservaEAlocacao} />
                      ) : null}
                      {pedido.status === "alocado" && (
                        <Button onClick={() => gerarTarefasDePicking(pedido.id)}>Gerar tarefas de picking</Button>
                      )}
                      {pedido.status !== "concluido" && pedido.status !== "cancelado" && (
                        <Button variant="secondary" onClick={() => cancelarPedido(pedido.id)}>
                          Cancelar
                        </Button>
                      )}
                    </div>

                    <table className="mt-3 w-full">
                      <thead>
                        <tr className="type-label text-steel">
                          <Th>Produto</Th>
                          <Th>Solicitado</Th>
                          <Th>Reservado</Th>
                          <Th>Alocado</Th>
                          <Th>Endereço(s)</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {pedido.itens.map((item) => (
                          <tr key={item.id} className="type-body-small border-t border-mist">
                            <Td className="type-technical">{nomeProduto(item.produtoId)}</Td>
                            <Td>{item.quantidadeSolicitada}</Td>
                            <Td>{item.quantidadeReservada}</Td>
                            <Td>{item.quantidadeAlocada}</Td>
                            <Td className="type-technical text-steel">
                              {item.alocacoes?.map((a) => codigoEndereco(posicoes.find((p) => p.id === a.posicaoId)?.enderecoId ?? "")).join(", ") || "—"}
                            </Td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function AcaoReservar({ pedidoId, onProcessar }: { pedidoId: string; onProcessar: (id: string, estrategia: EstrategiaAlocacao) => void }) {
  const [estrategia, setEstrategia] = useState<EstrategiaAlocacao>("FEFO");
  return (
    <div className="flex items-end gap-2">
      <SelectField label="Estratégia" value={estrategia} onChange={(e) => setEstrategia(e.target.value as EstrategiaAlocacao)}>
        {ESTRATEGIAS.map((e) => (
          <option key={e} value={e}>
            {e}
          </option>
        ))}
      </SelectField>
      <Button onClick={() => onProcessar(pedidoId, estrategia)}>Reservar e alocar</Button>
    </div>
  );
}

function FormularioPedido({
  produtos,
  onCriar,
}: {
  produtos: { id: string; sku: string }[];
  onCriar: (dados: { numero: string; prioridade: PrioridadePedido; itens: { produtoId: string; quantidadeSolicitada: number }[] }) => void;
}) {
  const [numero, setNumero] = useState("");
  const [prioridade, setPrioridade] = useState<PrioridadePedido>("normal");
  const [itens, setItens] = useState<{ produtoId: string; quantidadeSolicitada: number }[]>([
    { produtoId: produtos[0]?.id ?? "", quantidadeSolicitada: 1 },
  ]);

  function atualizarItem(indice: number, campo: "produtoId" | "quantidadeSolicitada", valor: string | number) {
    setItens((prev) => prev.map((item, i) => (i === indice ? { ...item, [campo]: valor } : item)));
  }

  return (
    <form
      className="flex flex-col gap-4 rounded-lg border border-mist p-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!numero.trim() || itens.some((i) => !i.produtoId || i.quantidadeSolicitada <= 0)) return;
        onCriar({ numero, prioridade, itens });
        setNumero("");
        setItens([{ produtoId: produtos[0]?.id ?? "", quantidadeSolicitada: 1 }]);
      }}
    >
      <div className="flex flex-wrap items-end gap-4">
        <TextField label="Número do pedido" value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Ex: 10284" />
        <SelectField label="Prioridade" value={prioridade} onChange={(e) => setPrioridade(e.target.value as PrioridadePedido)}>
          {PRIORIDADES.map((p) => (
            <option key={p} value={p}>
              {rotuloPrioridade[p]}
            </option>
          ))}
        </SelectField>
      </div>

      <div className="flex flex-col gap-2">
        <p className="type-label text-steel">Itens</p>
        {itens.map((item, indice) => (
          <div key={indice} className="flex items-end gap-3">
            <SelectField
              label="Produto"
              value={item.produtoId}
              onChange={(e) => atualizarItem(indice, "produtoId", e.target.value)}
            >
              {produtos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sku}
                </option>
              ))}
            </SelectField>
            <TextField
              label="Quantidade"
              type="number"
              min={1}
              value={item.quantidadeSolicitada}
              onChange={(e) => atualizarItem(indice, "quantidadeSolicitada", Number(e.target.value))}
            />
            {itens.length > 1 && (
              <Button type="button" variant="secondary" onClick={() => setItens((prev) => prev.filter((_, i) => i !== indice))}>
                Remover
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          className="self-start"
          onClick={() => setItens((prev) => [...prev, { produtoId: produtos[0]?.id ?? "", quantidadeSolicitada: 1 }])}
        >
          + Adicionar item
        </Button>
      </div>

      <div>
        <Button type="submit">Criar pedido</Button>
      </div>
    </form>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2 text-left">{children}</th>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2 ${className}`}>{children}</td>;
}
