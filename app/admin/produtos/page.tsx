"use client";

import { useState } from "react";
import { useProdutos } from "@/data/store";
import { Button, TextField, SelectField } from "@/components/ui";
import { EmptyState } from "@/components/EmptyState";
import type { UnidadeMedida } from "@/domain/produto";

const UNIDADES: UnidadeMedida[] = ["UN", "CX", "PLT", "KG", "L"];

export default function ProdutosPage() {
  const { produtos, criarProduto } = useProdutos();

  const [sku, setSku] = useState("");
  const [descricao, setDescricao] = useState("");
  const [unidade, setUnidade] = useState<UnidadeMedida>("UN");
  const [controlaLote, setControlaLote] = useState(false);
  const [controlaValidade, setControlaValidade] = useState(false);
  const [controlaSerial, setControlaSerial] = useState(false);

  function aoSubmeter(e: React.FormEvent) {
    e.preventDefault();
    if (!sku.trim() || !descricao.trim()) return;
    criarProduto({
      sku,
      descricao,
      unidade,
      ativo: true,
      controlaLote,
      controlaValidade,
      controlaSerial,
    });
    setSku("");
    setDescricao("");
    setControlaLote(false);
    setControlaValidade(false);
    setControlaSerial(false);
  }

  return (
    <div className="flex max-w-4xl flex-col gap-8">
      <div>
        <p className="type-label text-steel">Administração · Produtos</p>
        <h1 className="type-h1 mt-1 text-navy">Produtos</h1>
        <p className="type-body mt-2 text-steel">
          Cadastro base de SKU. Campos avançados (dimensões, restrições) entram conforme a operação exigir.
        </p>
      </div>

      <form onSubmit={aoSubmeter} className="flex flex-col gap-4 rounded-lg border border-mist p-5">
        <div className="flex flex-wrap gap-4">
          <TextField label="SKU" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Ex: SKU-4582" />
          <TextField
            label="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex: Pomada modeladora 120g"
            className="min-w-64"
          />
          <SelectField label="Unidade" value={unidade} onChange={(e) => setUnidade(e.target.value as UnidadeMedida)}>
            {UNIDADES.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </SelectField>
        </div>

        <div className="flex flex-wrap gap-5">
          <Checkbox rotulo="Controla lote" checked={controlaLote} onChange={setControlaLote} />
          <Checkbox rotulo="Controla validade" checked={controlaValidade} onChange={setControlaValidade} />
          <Checkbox rotulo="Controla serial" checked={controlaSerial} onChange={setControlaSerial} />
        </div>

        <div>
          <Button type="submit">Cadastrar produto</Button>
        </div>
      </form>

      {produtos.length === 0 ? (
        <EmptyState titulo="Nenhum produto cadastrado" descricao="Cadastre o primeiro SKU para começar a montar o catálogo." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-mist">
          <table className="w-full">
            <thead className="bg-stone">
              <tr>
                <Th>SKU</Th>
                <Th>Descrição</Th>
                <Th>Unidade</Th>
                <Th>Controles</Th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((p) => (
                <tr key={p.id} className="border-t border-mist">
                  <Td className="type-technical">{p.sku}</Td>
                  <Td className="type-body-small">{p.descricao}</Td>
                  <Td className="type-body-small">{p.unidade}</Td>
                  <Td className="type-caption text-steel">
                    {[p.controlaLote && "Lote", p.controlaValidade && "Validade", p.controlaSerial && "Serial"]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Checkbox({ rotulo, checked, onChange }: { rotulo: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="type-body-small flex items-center gap-2">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {rotulo}
    </label>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="type-label px-4 py-3 text-left text-steel">{children}</th>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}
