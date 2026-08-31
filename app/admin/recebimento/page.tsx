"use client";

import { useState } from "react";
import { useEstrutura, useProdutos } from "@/data/store";
import { useEstoque } from "@/data/inventory-store";
import { useTarefas } from "@/data/task-store";
import { useRecebimento } from "@/data/receiving-store";
import { Button, TextField, SelectField } from "@/components/ui";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { rotuloStatusDocumento, statusDocumentoParaBadge, rotuloStatusItem } from "@/domain/recebimento-labels";
import { rotuloStatusTarefa } from "@/domain/tarefa-labels";

export default function RecebimentoPage() {
  const { produtos } = useProdutos();
  const { enderecos } = useEstrutura();
  const { registrarEntrada } = useEstoque();
  const { tarefas, criarTarefa } = useTarefas();
  const { documentos, criarDocumento, conferirItem, aprovarDocumento, vincularTarefaPutaway, concluirItem } = useRecebimento();

  const nomeProduto = (id: string) => produtos.find((p) => p.id === id)?.sku ?? id;
  const tarefaDoItem = (tarefaId?: string) => (tarefaId ? tarefas.find((t) => t.id === tarefaId) : undefined);

  function aoAprovar(documentoId: string) {
    const doc = documentos.find((d) => d.id === documentoId);
    if (!doc) return;
    for (const item of doc.itens) {
      if (item.status !== "conferido" || !item.quantidadeRecebida) continue;
      const tarefaId = criarTarefa({
        tipo: "putaway",
        prioridade: "normal",
        produtoId: item.produtoId,
        quantidade: item.quantidadeRecebida,
      });
      vincularTarefaPutaway(documentoId, item.id, tarefaId);
    }
    aprovarDocumento(documentoId);
  }

  return (
    <div className="flex max-w-5xl flex-col gap-10">
      <div>
        <p className="type-label text-steel">Administração · Recebimento</p>
        <h1 className="type-h1 mt-1 text-navy">Recebimento</h1>
        <p className="type-body mt-2 text-steel">
          Documento → Conferência → Aprovação → Put-away. O put-away é uma tarefa real do motor de tarefas; ao concluí-la, o estoque é criado.
        </p>
      </div>

      {produtos.length === 0 ? (
        <EmptyState titulo="Cadastre produtos primeiro" descricao="Um documento de recebimento precisa referenciar produtos já cadastrados (Admin › Produtos)." />
      ) : (
        <>
          <section className="flex flex-col gap-3">
            <h2 className="type-h2">Novo documento de recebimento</h2>
            <FormularioDocumento produtos={produtos} onCriar={criarDocumento} />
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="type-h2">Documentos</h2>
            {documentos.length === 0 ? (
              <EmptyState titulo="Nenhum recebimento registrado" descricao="Crie o primeiro documento para iniciar a conferência." />
            ) : (
              <div className="flex flex-col gap-4">
                {documentos.map((doc) => {
                  const todosConferidos = doc.itens.every((i) => i.status !== "pendente");
                  return (
                    <div key={doc.id} className="rounded-lg border border-mist p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <p className="type-h3">#{doc.numero}</p>
                          <StatusBadge status={statusDocumentoParaBadge(doc.status)} />
                          <span className="type-metadata text-steel">{rotuloStatusDocumento[doc.status]}</span>
                        </div>
                        {doc.status === "em_conferencia" && todosConferidos && (
                          <Button onClick={() => aoAprovar(doc.id)}>Aprovar recebimento</Button>
                        )}
                      </div>

                      <div className="mt-3 flex flex-col gap-3">
                        {doc.itens.map((item) => {
                          const tarefa = tarefaDoItem(item.tarefaPutawayId);
                          return (
                            <div key={item.id} className="rounded-md bg-stone p-3">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="type-body-small">
                                  {nomeProduto(item.produtoId)} — esperado {item.quantidadeEsperada}
                                  {item.quantidadeRecebida !== undefined && `, recebido ${item.quantidadeRecebida}`}
                                </span>
                                <span className="type-caption text-steel">{rotuloStatusItem[item.status]}</span>
                              </div>

                              {item.status === "pendente" && (
                                <FormularioConferencia
                                  produtoId={item.produtoId}
                                  produtos={produtos}
                                  onConferir={(dados) => conferirItem(doc.id, item.id, dados)}
                                />
                              )}

                              {item.status === "aguardando_putaway" && tarefa && (
                                <p className="type-caption mt-2 text-steel">
                                  Tarefa de put-away: {rotuloStatusTarefa[tarefa.status]}
                                  {tarefa.status !== "concluida" && " — conclua em Admin › Tarefas para liberar o put-away"}
                                </p>
                              )}

                              {item.status === "aguardando_putaway" && tarefa?.status === "concluida" && (
                                <FormularioPutaway enderecos={enderecos} onFinalizar={(enderecoId) => {
                                  registrarEntrada({
                                    produtoId: item.produtoId,
                                    enderecoId,
                                    quantidade: item.quantidadeRecebida ?? 0,
                                    lote: item.lote,
                                    validade: item.validade,
                                  });
                                  concluirItem(doc.id, item.id, enderecoId);
                                }} />
                              )}

                              {item.status === "concluido" && (
                                <p className="type-caption mt-2 text-steel">
                                  Estoque criado em {enderecos.find((e) => e.id === item.enderecoDestinoId)?.codigo ?? item.enderecoDestinoId}.
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
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

function FormularioDocumento({
  produtos,
  onCriar,
}: {
  produtos: { id: string; sku: string }[];
  onCriar: (numero: string, itens: { produtoId: string; quantidadeEsperada: number }[]) => void;
}) {
  const [numero, setNumero] = useState("");
  const [itens, setItens] = useState<{ produtoId: string; quantidadeEsperada: number }[]>([
    { produtoId: produtos[0]?.id ?? "", quantidadeEsperada: 1 },
  ]);

  function atualizarItem(indice: number, campo: "produtoId" | "quantidadeEsperada", valor: string | number) {
    setItens((prev) => prev.map((item, i) => (i === indice ? { ...item, [campo]: valor } : item)));
  }

  return (
    <form
      className="flex flex-col gap-4 rounded-lg border border-mist p-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!numero.trim() || itens.some((i) => !i.produtoId || i.quantidadeEsperada <= 0)) return;
        onCriar(numero, itens);
        setNumero("");
        setItens([{ produtoId: produtos[0]?.id ?? "", quantidadeEsperada: 1 }]);
      }}
    >
      <TextField label="Número do documento" value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Ex: NF-88213" />

      <div className="flex flex-col gap-2">
        <p className="type-label text-steel">Itens esperados</p>
        {itens.map((item, indice) => (
          <div key={indice} className="flex items-end gap-3">
            <SelectField label="Produto" value={item.produtoId} onChange={(e) => atualizarItem(indice, "produtoId", e.target.value)}>
              {produtos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sku}
                </option>
              ))}
            </SelectField>
            <TextField
              label="Quantidade esperada"
              type="number"
              min={1}
              value={item.quantidadeEsperada}
              onChange={(e) => atualizarItem(indice, "quantidadeEsperada", Number(e.target.value))}
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
          onClick={() => setItens((prev) => [...prev, { produtoId: produtos[0]?.id ?? "", quantidadeEsperada: 1 }])}
        >
          + Adicionar item
        </Button>
      </div>

      <div>
        <Button type="submit">Criar documento</Button>
      </div>
    </form>
  );
}

function FormularioConferencia({
  produtoId,
  produtos,
  onConferir,
}: {
  produtoId: string;
  produtos: { id: string; sku: string; controlaLote: boolean; controlaValidade: boolean }[];
  onConferir: (dados: { quantidadeRecebida: number; lote?: string; validade?: string }) => void;
}) {
  const produto = produtos.find((p) => p.id === produtoId);
  const [quantidade, setQuantidade] = useState(0);
  const [lote, setLote] = useState("");
  const [validade, setValidade] = useState("");

  return (
    <form
      className="mt-2 flex flex-wrap items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (quantidade <= 0) return;
        onConferir({ quantidadeRecebida: quantidade, lote: lote || undefined, validade: validade || undefined });
      }}
    >
      <TextField label="Quantidade recebida" type="number" min={1} value={quantidade || ""} onChange={(e) => setQuantidade(Number(e.target.value))} />
      {produto?.controlaLote && <TextField label="Lote" value={lote} onChange={(e) => setLote(e.target.value)} />}
      {produto?.controlaValidade && <TextField label="Validade" type="date" value={validade} onChange={(e) => setValidade(e.target.value)} />}
      <Button type="submit" variant="secondary">
        Conferir item
      </Button>
    </form>
  );
}

function FormularioPutaway({
  enderecos,
  onFinalizar,
}: {
  enderecos: { id: string; codigo: string }[];
  onFinalizar: (enderecoId: string) => void;
}) {
  const [enderecoId, setEnderecoId] = useState(enderecos[0]?.id ?? "");

  if (enderecos.length === 0) {
    return <p className="type-caption mt-2 text-red">Cadastre um endereço de destino (Admin › Estrutura) para concluir o put-away.</p>;
  }

  return (
    <form
      className="mt-2 flex items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onFinalizar(enderecoId);
      }}
    >
      <SelectField label="Endereço de destino" value={enderecoId} onChange={(e) => setEnderecoId(e.target.value)}>
        {enderecos.map((end) => (
          <option key={end.id} value={end.id}>
            {end.codigo}
          </option>
        ))}
      </SelectField>
      <Button type="submit">Finalizar put-away</Button>
    </form>
  );
}
