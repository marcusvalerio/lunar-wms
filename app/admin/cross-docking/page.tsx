"use client";

import { useState } from "react";
import { useEstrutura, useProdutos } from "@/data/store";
import { useEstoque } from "@/data/inventory-store";
import { usePedidos } from "@/data/order-store";
import { useCrossDocking } from "@/data/crossdocking-store";
import { Button, TextField, SelectField } from "@/components/ui";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import type { ItemPedido } from "@/domain/pedido";

const rotuloStatus: Record<string, string> = { recebido: "Recebido", vinculado: "Vinculado à demanda", expedido: "Expedido" };

export default function CrossDockingPage() {
  const { produtos } = useProdutos();
  const { enderecos } = useEstrutura();
  const { registrarEntrada, reservar, confirmarPicking } = useEstoque();
  const { pedidos, atualizarItens } = usePedidos();
  const { operacoes, criarOperacao, vincular, expedir } = useCrossDocking();

  const nomeProduto = (id: string) => produtos.find((p) => p.id === id)?.sku ?? id;

  function aoCriar(produtoId: string, quantidade: number, enderecoId: string) {
    const posicaoId = registrarEntrada({ produtoId, enderecoId, quantidade });
    criarOperacao({ produtoId, quantidade, enderecoId, posicaoEstoqueId: posicaoId });
  }

  function aoVincular(operacaoId: string, pedidoId: string) {
    const operacao = operacoes.find((o) => o.id === operacaoId);
    const pedido = pedidos.find((p) => p.id === pedidoId);
    if (!operacao || !pedido) return;

    const item = pedido.itens.find((i) => i.produtoId === operacao.produtoId);
    if (!item) return;

    const resultado = reservar(operacao.produtoId, operacao.quantidade, "FIFO");
    const itemAtualizado: ItemPedido = {
      ...item,
      quantidadeReservada: item.quantidadeReservada + resultado.quantidadeAtendida,
      quantidadeAlocada: item.quantidadeAlocada + resultado.quantidadeAtendida,
      alocacoes: [...(item.alocacoes ?? []), ...resultado.alocacoes],
    };
    const itensAtualizados = pedido.itens.map((i) => (i.id === item.id ? itemAtualizado : i));
    const totalmenteAtendido = itensAtualizados.every((i) => i.quantidadeAlocada >= i.quantidadeSolicitada);
    atualizarItens(pedidoId, itensAtualizados, totalmenteAtendido ? "alocado" : pedido.status);

    vincular(operacaoId, pedidoId, item.id);
  }

  function aoExpedir(operacaoId: string) {
    const operacao = operacoes.find((o) => o.id === operacaoId);
    if (!operacao) return;
    confirmarPicking(operacao.posicaoEstoqueId, operacao.quantidade);
    expedir(operacaoId);
  }

  return (
    <div className="flex max-w-5xl flex-col gap-10">
      <div>
        <p className="type-label text-steel">Administração · Cross-docking</p>
        <h1 className="type-h1 mt-1 text-navy">Cross-docking</h1>
        <p className="type-body mt-2 text-steel">
          Recebimento → Checagem → Vínculo com a demanda → Expedição. O estoque é real, mas nunca passa por put-away.
        </p>
      </div>

      {produtos.length === 0 || enderecos.length === 0 ? (
        <EmptyState titulo="Cadastre produtos e endereços primeiro" descricao="Cross-docking precisa de produto (Admin › Produtos) e um endereço de doca/triagem (Admin › Estrutura)." />
      ) : (
        <>
          <section className="flex flex-col gap-3">
            <h2 className="type-h2">Registrar chegada para cross-docking</h2>
            <FormularioChegada produtos={produtos} enderecos={enderecos} onCriar={aoCriar} />
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="type-h2">Operações</h2>
            {operacoes.length === 0 ? (
              <EmptyState titulo="Nenhuma operação de cross-docking" descricao="Registre uma chegada acima para vinculá-la a um pedido." />
            ) : (
              <div className="flex flex-col gap-3">
                {operacoes.map((op) => {
                  const pedidosCompativeis = pedidos.filter(
                    (p) =>
                      p.status !== "concluido" &&
                      p.status !== "cancelado" &&
                      p.status !== "alocado" &&
                      p.itens.some((i) => i.produtoId === op.produtoId)
                  );
                  return (
                    <div key={op.id} className="rounded-lg border border-mist p-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="type-h3">{nomeProduto(op.produtoId)} — {op.quantidade} un.</p>
                        <StatusBadge status={op.status === "expedido" ? "concluido" : op.status === "vinculado" ? "emOperacao" : "pendente"} />
                        <span className="type-metadata text-steel">{rotuloStatus[op.status]}</span>
                      </div>

                      {op.status === "recebido" && (
                        <AcaoVincular pedidos={pedidosCompativeis} onVincular={(pedidoId) => aoVincular(op.id, pedidoId)} />
                      )}

                      {op.status === "vinculado" && (
                        <Button className="mt-2" onClick={() => aoExpedir(op.id)}>
                          Expedir (bypass do put-away)
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function AcaoVincular({ pedidos, onVincular }: { pedidos: { id: string; numero: string }[]; onVincular: (pedidoId: string) => void }) {
  const [pedidoId, setPedidoId] = useState(pedidos[0]?.id ?? "");

  if (pedidos.length === 0) {
    return <p className="type-caption mt-2 text-steel">Nenhum pedido pendente precisa deste produto no momento.</p>;
  }

  return (
    <div className="mt-2 flex items-end gap-2">
      <SelectField label="Vincular ao pedido" value={pedidoId} onChange={(e) => setPedidoId(e.target.value)}>
        {pedidos.map((p) => (
          <option key={p.id} value={p.id}>
            #{p.numero}
          </option>
        ))}
      </SelectField>
      <Button variant="secondary" onClick={() => onVincular(pedidoId)}>
        Vincular
      </Button>
    </div>
  );
}

function FormularioChegada({
  produtos,
  enderecos,
  onCriar,
}: {
  produtos: { id: string; sku: string }[];
  enderecos: { id: string; codigo: string }[];
  onCriar: (produtoId: string, quantidade: number, enderecoId: string) => void;
}) {
  const [produtoId, setProdutoId] = useState(produtos[0]?.id ?? "");
  const [quantidade, setQuantidade] = useState(0);
  const [enderecoId, setEnderecoId] = useState(enderecos[0]?.id ?? "");

  return (
    <form
      className="flex flex-wrap items-end gap-4 rounded-lg border border-mist p-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!produtoId || quantidade <= 0 || !enderecoId) return;
        onCriar(produtoId, quantidade, enderecoId);
        setQuantidade(0);
      }}
    >
      <SelectField label="Produto" value={produtoId} onChange={(e) => setProdutoId(e.target.value)}>
        {produtos.map((p) => (
          <option key={p.id} value={p.id}>
            {p.sku}
          </option>
        ))}
      </SelectField>
      <TextField label="Quantidade" type="number" min={1} value={quantidade || ""} onChange={(e) => setQuantidade(Number(e.target.value))} />
      <SelectField label="Endereço de doca/triagem" value={enderecoId} onChange={(e) => setEnderecoId(e.target.value)}>
        {enderecos.map((e) => (
          <option key={e.id} value={e.id}>
            {e.codigo}
          </option>
        ))}
      </SelectField>
      <Button type="submit">Registrar chegada</Button>
    </form>
  );
}
