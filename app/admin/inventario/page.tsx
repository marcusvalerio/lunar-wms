"use client";

import { useState } from "react";
import { useEstrutura, useProdutos } from "@/data/store";
import { useEstoque } from "@/data/inventory-store";
import { useContagem } from "@/data/counting-store";
import { Button, TextField } from "@/components/ui";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { rotuloStatusContagem, statusContagemParaBadge } from "@/domain/contagem-labels";

export default function InventarioPage() {
  const { produtos } = useProdutos();
  const { enderecos } = useEstrutura();
  const { posicoes, ajustarEstoque } = useEstoque();
  const { contagens, criarContagem, registrarContagem, solicitarRecontagem, registrarRecontagem, concluirSemAjuste, concluirComAjuste } =
    useContagem();

  const nomeProduto = (id: string) => produtos.find((p) => p.id === id)?.sku ?? id;
  const codigoEndereco = (id: string) => enderecos.find((e) => e.id === id)?.codigo ?? id;

  function iniciarContagem(posicaoId: string) {
    const posicao = posicoes.find((p) => p.id === posicaoId);
    if (!posicao) return;
    criarContagem({
      posicaoEstoqueId: posicao.id,
      produtoId: posicao.produtoId,
      enderecoId: posicao.enderecoId,
      quantidadeEsperada: posicao.quantidade,
    });
  }

  function aprovarAjuste(contagemId: string, quantidadeFinal: number) {
    const contagem = contagens.find((c) => c.id === contagemId);
    if (!contagem) return;
    ajustarEstoque(contagem.posicaoEstoqueId, quantidadeFinal, `Ajuste por contagem de inventário (${contagemId.slice(-6)})`);
    concluirComAjuste(contagemId);
  }

  const posicoesSemContagemAberta = posicoes.filter(
    (p) => !contagens.some((c) => c.posicaoEstoqueId === p.id && c.status !== "concluida")
  );

  return (
    <div className="flex max-w-5xl flex-col gap-10">
      <div>
        <p className="type-label text-steel">Administração · Inventário</p>
        <h1 className="type-h1 mt-1 text-navy">Contagem de Inventário</h1>
        <p className="type-body mt-2 text-steel">
          Se esperado = contado, a contagem conclui direto. Se divergir, recontagem e aprovação decidem o ajuste.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="type-h2">Posições de estoque</h2>
        {posicoesSemContagemAberta.length === 0 ? (
          <EmptyState
            titulo="Nenhuma posição disponível para contagem"
            descricao="Registre entradas de estoque (Admin › Estoque) ou aguarde a conclusão das contagens em andamento."
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-mist">
            <table className="w-full">
              <thead className="bg-stone">
                <tr>
                  <Th>Produto</Th>
                  <Th>Endereço</Th>
                  <Th>Quantidade no sistema</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {posicoesSemContagemAberta.map((p) => (
                  <tr key={p.id} className="border-t border-mist">
                    <Td className="type-technical">{nomeProduto(p.produtoId)}</Td>
                    <Td className="type-technical">{codigoEndereco(p.enderecoId)}</Td>
                    <Td className="type-data">{p.quantidade}</Td>
                    <Td>
                      <Button variant="secondary" onClick={() => iniciarContagem(p.id)}>
                        Iniciar contagem
                      </Button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="type-h2">Contagens</h2>
        {contagens.length === 0 ? (
          <EmptyState titulo="Nenhuma contagem registrada" descricao="Inicie uma contagem a partir de uma posição de estoque acima." />
        ) : (
          <div className="flex flex-col gap-3">
            {contagens.map((c) => (
              <div key={c.id} className="rounded-lg border border-mist p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <p className="type-h3">{nomeProduto(c.produtoId)}</p>
                    <span className="type-caption text-steel">{codigoEndereco(c.enderecoId)}</span>
                    <StatusBadge status={statusContagemParaBadge(c.status)} />
                    <span className="type-metadata text-steel">{rotuloStatusContagem[c.status]}</span>
                  </div>
                </div>

                <div className="type-body-small mt-2 flex flex-wrap gap-x-6 text-steel">
                  <span>Esperado: {c.quantidadeEsperada}</span>
                  {c.quantidadeContada !== undefined && <span>Contado: {c.quantidadeContada}</span>}
                  {c.quantidadeRecontada !== undefined && <span>Recontado: {c.quantidadeRecontada}</span>}
                </div>

                {c.status === "pendente" && (
                  <FormularioQuantidade rotulo="Quantidade contada" onConfirmar={(q) => registrarContagem(c.id, q)} />
                )}

                {c.status === "divergente" && (
                  <div className="mt-2 flex items-center gap-2">
                    <Button variant="secondary" onClick={() => solicitarRecontagem(c.id)}>
                      Solicitar recontagem
                    </Button>
                    <Button onClick={() => aprovarAjuste(c.id, c.quantidadeContada ?? c.quantidadeEsperada)}>
                      Aprovar ajuste (usar contagem)
                    </Button>
                  </div>
                )}

                {c.status === "recontagem" && (
                  <FormularioQuantidade rotulo="Quantidade recontada" onConfirmar={(q) => registrarRecontagem(c.id, q)} />
                )}

                {c.status === "aguardando_aprovacao" && (
                  <div className="mt-2 flex items-center gap-2">
                    {c.quantidadeRecontada === c.quantidadeEsperada ? (
                      <Button onClick={() => concluirSemAjuste(c.id)}>Concluir sem ajuste (recontagem confirmou o sistema)</Button>
                    ) : (
                      <Button onClick={() => aprovarAjuste(c.id, c.quantidadeRecontada ?? c.quantidadeEsperada)}>
                        Aprovar ajuste (usar recontagem)
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function FormularioQuantidade({ rotulo, onConfirmar }: { rotulo: string; onConfirmar: (quantidade: number) => void }) {
  const [quantidade, setQuantidade] = useState(0);
  return (
    <form
      className="mt-2 flex items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        onConfirmar(quantidade);
      }}
    >
      <TextField label={rotulo} type="number" min={0} value={quantidade || ""} onChange={(e) => setQuantidade(Number(e.target.value))} />
      <Button type="submit" variant="secondary">
        Confirmar
      </Button>
    </form>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return <th className="type-label px-4 py-3 text-left text-steel">{children}</th>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}
