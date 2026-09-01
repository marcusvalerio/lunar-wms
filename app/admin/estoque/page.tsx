"use client";

import { useState } from "react";
import { useEstrutura } from "@/data/store";
import { useProdutos } from "@/data/store";
import { useEstoque } from "@/data/inventory-store";
import { useConfiguracao } from "@/data/config-store";
import { Button, TextField, SelectField } from "@/components/ui";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import type { EstrategiaAlocacao } from "@/domain/pedido";

const ESTRATEGIAS: EstrategiaAlocacao[] = ["FEFO", "FIFO", "LIFO"];

export default function EstoquePage() {
  const { produtos } = useProdutos();
  const { enderecos } = useEstrutura();
  const { posicoes, reservar, saldoDaPosicao } = useEstoque();
  const { configuracao } = useConfiguracao();

  const [resultadoReserva, setResultadoReserva] = useState<string | null>(null);

  const nomeProduto = (id: string) => produtos.find((p) => p.id === id)?.sku ?? id;
  const codigoEndereco = (id: string) => enderecos.find((e) => e.id === id)?.codigo ?? id;

  return (
    <div className="flex max-w-5xl flex-col gap-10">
      <div>
        <p className="type-label text-steel">Administração · Estoque</p>
        <h1 className="type-h1 mt-1 text-navy">Motor de Estoque</h1>
        <p className="type-body mt-2 text-steel">
          O saldo nunca é editado diretamente — só existe a partir de movimentos (entrada, reserva, ajuste...).
        </p>
      </div>

      {produtos.length === 0 || enderecos.length === 0 ? (
        <EmptyState
          titulo="Cadastre produtos e endereços primeiro"
          descricao="O motor de estoque precisa de ao menos um produto (Admin › Produtos) e um endereço (Admin › Estrutura) para registrar entradas."
        />
      ) : (
        <>
          <section className="flex flex-col gap-3">
            <h2 className="type-h2">Registrar entrada</h2>
            <FormularioEntrada />
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="type-h2">Posições de estoque</h2>
            {posicoes.length === 0 ? (
              <EmptyState titulo="Nenhuma posição de estoque" descricao="Registre uma entrada para criar a primeira posição." />
            ) : (
              <div className="overflow-hidden rounded-lg border border-mist">
                <table className="w-full">
                  <thead className="bg-stone">
                    <tr>
                      <Th>Produto</Th>
                      <Th>Endereço</Th>
                      <Th>Lote</Th>
                      <Th>Validade</Th>
                      <Th>Físico</Th>
                      <Th>Reservado</Th>
                      <Th>Disponível</Th>
                      <Th>Status</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {posicoes.map((p) => {
                      const saldo = saldoDaPosicao(p.id);
                      return (
                        <tr key={p.id} className="border-t border-mist">
                          <Td className="type-technical">{nomeProduto(p.produtoId)}</Td>
                          <Td className="type-technical">{codigoEndereco(p.enderecoId)}</Td>
                          <Td className="type-body-small">{p.lote ?? "—"}</Td>
                          <Td className="type-body-small">{p.validade ?? "—"}</Td>
                          <Td className="type-data">{saldo.fisico}</Td>
                          <Td className="type-body-small text-steel">{saldo.reservado}</Td>
                          <Td className="type-data">{saldo.disponivel}</Td>
                          <Td>
                            <StatusBadge status={p.status === "disponivel" ? "disponivel" : "bloqueado"} />
                          </Td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="type-h2">Simulador de reserva / alocação</h2>
            <p className="type-body-small text-steel">
              Solicita uma quantidade para um produto e mostra, de forma determinística, quais posições atendem a demanda.
            </p>
            <FormularioReserva onReservar={reservar} onResultado={setResultadoReserva} />
            {resultadoReserva && <p className="type-body-small mt-1 rounded-md bg-stone px-3 py-2">{resultadoReserva}</p>}
          </section>
        </>
      )}
    </div>
  );

  function FormularioEntrada() {
    const [produtoId, setProdutoId] = useState(produtos[0]?.id ?? "");
    const [enderecoId, setEnderecoId] = useState(enderecos[0]?.id ?? "");
    const [quantidade, setQuantidade] = useState(0);
    const [lote, setLote] = useState("");
    const [validade, setValidade] = useState("");
    const { registrarEntrada } = useEstoque();

    const produtoSelecionado = produtos.find((p) => p.id === produtoId);

    return (
      <form
        className="flex flex-wrap items-end gap-4 rounded-lg border border-mist p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!produtoId || !enderecoId || quantidade <= 0) return;
          registrarEntrada({
            produtoId,
            enderecoId,
            quantidade,
            lote: lote || undefined,
            validade: validade || undefined,
          });
          setQuantidade(0);
          setLote("");
          setValidade("");
        }}
      >
        <SelectField label="Produto" value={produtoId} onChange={(e) => setProdutoId(e.target.value)}>
          {produtos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.sku} — {p.descricao}
            </option>
          ))}
        </SelectField>
        <SelectField label="Endereço" value={enderecoId} onChange={(e) => setEnderecoId(e.target.value)}>
          {enderecos.map((e) => (
            <option key={e.id} value={e.id}>
              {e.codigo}
            </option>
          ))}
        </SelectField>
        <TextField
          label="Quantidade"
          type="number"
          min={1}
          value={quantidade || ""}
          onChange={(e) => setQuantidade(Number(e.target.value))}
        />
        {produtoSelecionado?.controlaLote && (
          <TextField label="Lote" value={lote} onChange={(e) => setLote(e.target.value)} placeholder="Ex: L2026-08" />
        )}
        {produtoSelecionado?.controlaValidade && (
          <TextField label="Validade" type="date" value={validade} onChange={(e) => setValidade(e.target.value)} />
        )}
        <Button type="submit">Registrar entrada</Button>
      </form>
    );
  }

  function FormularioReserva({
    onReservar,
    onResultado,
  }: {
    onReservar: (produtoId: string, quantidade: number, estrategia: EstrategiaAlocacao) => { quantidadeAtendida: number; quantidadeNaoAtendida: number; alocacoes: { posicaoId: string; quantidade: number }[] };
    onResultado: (texto: string) => void;
  }) {
    const [produtoId, setProdutoId] = useState(produtos[0]?.id ?? "");
    const [quantidade, setQuantidade] = useState(0);
    const [estrategia, setEstrategia] = useState<EstrategiaAlocacao>(configuracao.estrategiaAlocacaoPadrao);

    return (
      <form
        className="flex flex-wrap items-end gap-4 rounded-lg border border-mist p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!produtoId || quantidade <= 0) return;
          const resultado = onReservar(produtoId, quantidade, estrategia);
          const partes = resultado.alocacoes.map((a) => `${codigoEndereco(posicoes.find((p) => p.id === a.posicaoId)?.enderecoId ?? "")}: ${a.quantidade}`);
          onResultado(
            resultado.quantidadeNaoAtendida > 0
              ? `Atendido: ${resultado.quantidadeAtendida} (${partes.join(", ") || "nenhuma posição"}). Não atendido: ${resultado.quantidadeNaoAtendida}.`
              : `Atendido integralmente via ${estrategia}: ${partes.join(", ")}.`
          );
        }}
      >
        <SelectField label="Produto" value={produtoId} onChange={(e) => setProdutoId(e.target.value)}>
          {produtos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.sku}
            </option>
          ))}
        </SelectField>
        <TextField
          label="Quantidade desejada"
          type="number"
          min={1}
          value={quantidade || ""}
          onChange={(e) => setQuantidade(Number(e.target.value))}
        />
        <SelectField label="Estratégia" value={estrategia} onChange={(e) => setEstrategia(e.target.value as EstrategiaAlocacao)}>
          {ESTRATEGIAS.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </SelectField>
        <Button type="submit" variant="secondary">
          Reservar
        </Button>
      </form>
    );
  }
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="type-label px-4 py-3 text-left text-steel">{children}</th>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}
