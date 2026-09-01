"use client";

import { useState } from "react";
import { useEstrutura, useProdutos } from "@/data/store";
import { useEstoque } from "@/data/inventory-store";
import { useDevolucao } from "@/data/returns-store";
import { Button, TextField, SelectField } from "@/components/ui";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import type { MotivoDevolucao, CondicaoProduto, DecisaoDevolucao } from "@/domain/devolucao";
import { rotuloMotivoDevolucao, rotuloCondicao, rotuloDecisao, rotuloStatusDevolucao, statusDevolucaoParaBadge } from "@/domain/devolucao-labels";

const MOTIVOS: MotivoDevolucao[] = ["avaria", "divergencia_pedido", "insatisfacao_cliente", "produto_incorreto", "outro"];
const CONDICOES: CondicaoProduto[] = ["boa", "avariada", "impropria_para_venda"];

export default function DevolucoesPage() {
  const { produtos } = useProdutos();
  const { enderecos } = useEstrutura();
  const { registrarEntrada } = useEstoque();
  const { devolucoes, criarDevolucao, registrarInspecao, decidir, concluir } = useDevolucao();

  const nomeProduto = (id: string) => produtos.find((p) => p.id === id)?.sku ?? id;

  function aoConcluir(id: string) {
    const devolucao = devolucoes.find((d) => d.id === id);
    if (!devolucao || !devolucao.decisao) return;

    if (devolucao.decisao === "estoque" && devolucao.enderecoDestinoId) {
      registrarEntrada({ produtoId: devolucao.produtoId, enderecoId: devolucao.enderecoDestinoId, quantidade: devolucao.quantidade });
    } else if (devolucao.decisao === "quarentena" && devolucao.enderecoDestinoId) {
      registrarEntrada({
        produtoId: devolucao.produtoId,
        enderecoId: devolucao.enderecoDestinoId,
        quantidade: devolucao.quantidade,
        status: "quarentena",
      });
    }
    // "descarte" não cria posição de estoque — o produto sai do fluxo.

    concluir(id);
  }

  return (
    <div className="flex max-w-5xl flex-col gap-10">
      <div>
        <p className="type-label text-steel">Administração · Devoluções</p>
        <h1 className="type-h1 mt-1 text-navy">Devoluções</h1>
        <p className="type-body mt-2 text-steel">
          Recebimento → Checagem → Motivo → Condição → Decisão. Nunca volta ao estoque disponível automaticamente.
        </p>
      </div>

      {produtos.length === 0 ? (
        <EmptyState titulo="Cadastre produtos primeiro" descricao="Uma devolução precisa referenciar um produto já cadastrado (Admin › Produtos)." />
      ) : (
        <>
          <section className="flex flex-col gap-3">
            <h2 className="type-h2">Registrar devolução</h2>
            <FormularioDevolucao produtos={produtos} onCriar={criarDevolucao} />
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="type-h2">Devoluções</h2>
            {devolucoes.length === 0 ? (
              <EmptyState titulo="Nenhuma devolução registrada" descricao="Registre a primeira devolução para iniciar a inspeção." />
            ) : (
              <div className="flex flex-col gap-3">
                {devolucoes.map((d) => (
                  <div key={d.id} className="rounded-lg border border-mist p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="type-h3">#{d.numero}</p>
                      <StatusBadge status={statusDevolucaoParaBadge(d.status)} />
                      <span className="type-metadata text-steel">{rotuloStatusDevolucao[d.status]}</span>
                    </div>
                    <div className="type-body-small mt-2 flex flex-wrap gap-x-6 text-steel">
                      <span>{nomeProduto(d.produtoId)} — {d.quantidade} un.</span>
                      <span>Motivo: {rotuloMotivoDevolucao[d.motivo]}</span>
                      {d.condicao && <span>Condição: {rotuloCondicao[d.condicao]}</span>}
                      {d.decisao && <span>Decisão: {rotuloDecisao[d.decisao]}</span>}
                    </div>

                    {d.status === "recebida" && (
                      <div className="mt-2 flex items-end gap-2">
                        <SelectField
                          label="Condição do produto"
                          onChange={(e) => registrarInspecao(d.id, e.target.value as CondicaoProduto)}
                          defaultValue=""
                        >
                          <option value="" disabled>
                            Selecione
                          </option>
                          {CONDICOES.map((c) => (
                            <option key={c} value={c}>
                              {rotuloCondicao[c]}
                            </option>
                          ))}
                        </SelectField>
                      </div>
                    )}

                    {d.status === "em_inspecao" && (
                      <FormularioDecisao
                        condicao={d.condicao!}
                        enderecos={enderecos}
                        onDecidir={(decisao, enderecoId) => decidir(d.id, decisao, enderecoId)}
                      />
                    )}

                    {d.status === "decidida" && (
                      <Button className="mt-2" onClick={() => aoConcluir(d.id)}>
                        Concluir devolução
                      </Button>
                    )}
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

function FormularioDevolucao({
  produtos,
  onCriar,
}: {
  produtos: { id: string; sku: string }[];
  onCriar: (dados: { numero: string; produtoId: string; quantidade: number; motivo: MotivoDevolucao }) => void;
}) {
  const [numero, setNumero] = useState("");
  const [produtoId, setProdutoId] = useState(produtos[0]?.id ?? "");
  const [quantidade, setQuantidade] = useState(0);
  const [motivo, setMotivo] = useState<MotivoDevolucao>("avaria");

  return (
    <form
      className="flex flex-wrap items-end gap-4 rounded-lg border border-mist p-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!numero.trim() || !produtoId || quantidade <= 0) return;
        onCriar({ numero, produtoId, quantidade, motivo });
        setNumero("");
        setQuantidade(0);
      }}
    >
      <TextField label="Número" value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Ex: DEV-0091" />
      <SelectField label="Produto" value={produtoId} onChange={(e) => setProdutoId(e.target.value)}>
        {produtos.map((p) => (
          <option key={p.id} value={p.id}>
            {p.sku}
          </option>
        ))}
      </SelectField>
      <TextField label="Quantidade" type="number" min={1} value={quantidade || ""} onChange={(e) => setQuantidade(Number(e.target.value))} />
      <SelectField label="Motivo" value={motivo} onChange={(e) => setMotivo(e.target.value as MotivoDevolucao)}>
        {MOTIVOS.map((m) => (
          <option key={m} value={m}>
            {rotuloMotivoDevolucao[m]}
          </option>
        ))}
      </SelectField>
      <Button type="submit">Registrar devolução</Button>
    </form>
  );
}

function FormularioDecisao({
  condicao,
  enderecos,
  onDecidir,
}: {
  condicao: CondicaoProduto;
  enderecos: { id: string; codigo: string }[];
  onDecidir: (decisao: DecisaoDevolucao, enderecoId?: string) => void;
}) {
  const [decisao, setDecisao] = useState<DecisaoDevolucao>(condicao === "boa" ? "estoque" : "quarentena");
  const [enderecoId, setEnderecoId] = useState(enderecos[0]?.id ?? "");

  return (
    <form
      className="mt-2 flex flex-wrap items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onDecidir(decisao, decisao === "descarte" ? undefined : enderecoId);
      }}
    >
      <SelectField label="Decisão" value={decisao} onChange={(e) => setDecisao(e.target.value as DecisaoDevolucao)}>
        <option value="estoque">{rotuloDecisao.estoque}</option>
        <option value="quarentena">{rotuloDecisao.quarentena}</option>
        <option value="descarte">{rotuloDecisao.descarte}</option>
      </SelectField>
      {decisao !== "descarte" && enderecos.length > 0 && (
        <SelectField label="Endereço destino" value={enderecoId} onChange={(e) => setEnderecoId(e.target.value)}>
          {enderecos.map((end) => (
            <option key={end.id} value={end.id}>
              {end.codigo}
            </option>
          ))}
        </SelectField>
      )}
      <Button type="submit" variant="secondary">
        Confirmar decisão
      </Button>
    </form>
  );
}
