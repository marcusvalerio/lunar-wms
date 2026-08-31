"use client";

import { useState } from "react";
import { useProdutos } from "@/data/store";
import { usePedidos } from "@/data/order-store";
import { usePacking } from "@/data/packing-store";
import { Button, TextField, SelectField } from "@/components/ui";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";

export default function PackingPage() {
  const { produtos } = useProdutos();
  const { pedidos, atualizarItens } = usePedidos();
  const { volumes, criarVolume, adicionarItemAoVolume, fecharVolume } = usePacking();

  const nomeProduto = (id: string) => produtos.find((p) => p.id === id)?.sku ?? id;
  const pedidosEmPacking = pedidos.filter((p) => p.status === "packing");

  function concluirPacking(pedidoId: string) {
    const pedido = pedidos.find((p) => p.id === pedidoId);
    if (!pedido) return;
    atualizarItens(pedidoId, pedido.itens, "expedicao");
  }

  function totalEmbaladoDoPedido(pedidoId: string, produtoId: string): number {
    return volumes
      .filter((v) => v.pedidoId === pedidoId)
      .flatMap((v) => v.itens)
      .filter((i) => i.produtoId === produtoId)
      .reduce((soma, i) => soma + i.quantidade, 0);
  }

  return (
    <div className="flex max-w-5xl flex-col gap-10">
      <div>
        <p className="type-label text-steel">Administração · Packing</p>
        <h1 className="type-h1 mt-1 text-navy">Packing</h1>
        <p className="type-body mt-2 text-steel">
          Pedido → Volume → Itens → Peso/Dimensões → Fechamento. Montar e fechar um volume são ações separadas.
        </p>
      </div>

      {pedidosEmPacking.length === 0 ? (
        <EmptyState
          titulo="Nenhum pedido em packing"
          descricao="Pedidos aparecem aqui depois que o picking é confirmado e a conferência avança para packing (Admin › Pedidos)."
        />
      ) : (
        <div className="flex flex-col gap-6">
          {pedidosEmPacking.map((pedido) => {
            const volumesDoPedido = volumes.filter((v) => v.pedidoId === pedido.id);
            const totalmenteEmbalado = pedido.itens.every(
              (item) => totalEmbaladoDoPedido(pedido.id, item.produtoId) >= item.quantidadeAlocada
            );

            return (
              <div key={pedido.id} className="rounded-lg border border-mist p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="type-h3">Pedido #{pedido.numero}</p>
                  <Button disabled={!totalmenteEmbalado} onClick={() => concluirPacking(pedido.id)}>
                    Concluir packing
                  </Button>
                </div>

                <div className="type-body-small mt-2 flex flex-wrap gap-x-6 gap-y-1 text-steel">
                  {pedido.itens.map((item) => (
                    <span key={item.id}>
                      {nomeProduto(item.produtoId)}: {totalEmbaladoDoPedido(pedido.id, item.produtoId)}/{item.quantidadeAlocada} embalado
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex flex-col gap-3">
                  <Button variant="secondary" className="self-start" onClick={() => criarVolume(pedido.id)}>
                    + Novo volume
                  </Button>

                  {volumesDoPedido.length === 0 ? (
                    <p className="type-caption text-steel">Nenhum volume criado ainda.</p>
                  ) : (
                    volumesDoPedido.map((volume) => (
                      <div key={volume.id} className="rounded-md bg-stone p-3">
                        <div className="flex items-center justify-between">
                          <span className="type-label text-steel">Volume {volume.id.slice(-6)}</span>
                          <StatusBadge status={volume.status === "fechado" ? "concluido" : "emOperacao"} />
                        </div>

                        {volume.itens.length > 0 && (
                          <ul className="type-body-small mt-2 flex flex-col gap-1">
                            {volume.itens.map((i) => (
                              <li key={i.produtoId}>
                                {nomeProduto(i.produtoId)} — {i.quantidade}
                              </li>
                            ))}
                          </ul>
                        )}

                        {volume.status === "montando" ? (
                          <div className="mt-2 flex flex-col gap-2">
                            <FormularioAdicionarItem
                              produtos={pedido.itens.map((i) => ({ id: i.produtoId, sku: nomeProduto(i.produtoId) }))}
                              onAdicionar={(produtoId, quantidade) => adicionarItemAoVolume(volume.id, produtoId, quantidade)}
                            />
                            <FormularioFecharVolume onFechar={(dados) => fecharVolume(volume.id, dados)} />
                          </div>
                        ) : (
                          <p className="type-caption mt-2 text-steel">
                            {volume.pesoKg}kg · {volume.alturaCm}×{volume.larguraCm}×{volume.comprimentoCm}cm
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FormularioAdicionarItem({
  produtos,
  onAdicionar,
}: {
  produtos: { id: string; sku: string }[];
  onAdicionar: (produtoId: string, quantidade: number) => void;
}) {
  const [produtoId, setProdutoId] = useState(produtos[0]?.id ?? "");
  const [quantidade, setQuantidade] = useState(0);

  return (
    <form
      className="flex items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!produtoId || quantidade <= 0) return;
        onAdicionar(produtoId, quantidade);
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
      <Button type="submit" variant="secondary">
        Adicionar ao volume
      </Button>
    </form>
  );
}

function FormularioFecharVolume({
  onFechar,
}: {
  onFechar: (dados: { pesoKg: number; alturaCm: number; larguraCm: number; comprimentoCm: number }) => void;
}) {
  const [pesoKg, setPesoKg] = useState(0);
  const [alturaCm, setAlturaCm] = useState(0);
  const [larguraCm, setLarguraCm] = useState(0);
  const [comprimentoCm, setComprimentoCm] = useState(0);

  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (pesoKg <= 0 || alturaCm <= 0 || larguraCm <= 0 || comprimentoCm <= 0) return;
        onFechar({ pesoKg, alturaCm, larguraCm, comprimentoCm });
      }}
    >
      <TextField label="Peso (kg)" type="number" min={0.01} step={0.01} value={pesoKg || ""} onChange={(e) => setPesoKg(Number(e.target.value))} />
      <TextField label="Altura (cm)" type="number" min={1} value={alturaCm || ""} onChange={(e) => setAlturaCm(Number(e.target.value))} />
      <TextField label="Largura (cm)" type="number" min={1} value={larguraCm || ""} onChange={(e) => setLarguraCm(Number(e.target.value))} />
      <TextField label="Comprimento (cm)" type="number" min={1} value={comprimentoCm || ""} onChange={(e) => setComprimentoCm(Number(e.target.value))} />
      <Button type="submit">Fechar volume</Button>
    </form>
  );
}
