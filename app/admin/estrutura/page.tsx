"use client";

import { useState } from "react";
import { useEstrutura } from "@/data/store";
import { Button, TextField, SelectField } from "@/components/ui";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import type { TipoZona, StatusEstrutural } from "@/domain/warehouse";

const TIPOS_ZONA: TipoZona[] = [
  "recebimento",
  "armazenagem",
  "picking",
  "packing",
  "expedicao",
  "quarentena",
  "devolucoes",
];

const rotuloTipoZona: Record<TipoZona, string> = {
  recebimento: "Recebimento",
  armazenagem: "Armazenagem",
  picking: "Picking",
  packing: "Packing",
  expedicao: "Expedição",
  quarentena: "Quarentena",
  devolucoes: "Devoluções",
};

function statusParaBadge(status: StatusEstrutural) {
  if (status === "ativo") return "disponivel" as const;
  if (status === "em_configuracao") return "pendente" as const;
  return "bloqueado" as const;
}

export default function EstruturaPage() {
  const estrutura = useEstrutura();
  const [empresaSelecionada, setEmpresaSelecionada] = useState<string | null>(null);
  const [centroSelecionado, setCentroSelecionado] = useState<string | null>(null);
  const [armazemSelecionado, setArmazemSelecionado] = useState<string | null>(null);
  const [zonaSelecionada, setZonaSelecionada] = useState<string | null>(null);

  const centrosDaEmpresa = estrutura.centros.filter((c) => c.empresaId === empresaSelecionada);
  const armazensDoCentro = estrutura.armazens.filter((a) => a.centroDistribuicaoId === centroSelecionado);
  const zonasDoArmazem = estrutura.zonas.filter((z) => z.armazemId === armazemSelecionado);
  const areasDaZona = estrutura.areas.filter((a) => a.zonaId === zonaSelecionada);
  const enderecosPorArea = (areaId: string) => estrutura.enderecos.filter((e) => e.areaId === areaId);

  return (
    <div className="flex max-w-5xl flex-col gap-10">
      <div>
        <p className="type-label text-steel">Administração · Estrutura</p>
        <h1 className="type-h1 mt-1 text-navy">Estrutura do Armazém</h1>
        <p className="type-body mt-2 text-steel">
          Empresa → Centro de Distribuição → Armazém → Zona → Área → Endereço.
        </p>
      </div>

      {/* EMPRESA */}
      <Secao titulo="Empresas">
        <FormularioEmpresa onCriar={estrutura.criarEmpresa} />
        {estrutura.empresas.length === 0 ? (
          <EmptyState titulo="Nenhuma empresa cadastrada" descricao="Cadastre a primeira empresa para começar a estruturar o armazém." />
        ) : (
          <ListaSelecionavel
            itens={estrutura.empresas.map((e) => ({ id: e.id, rotulo: e.nome, status: e.status }))}
            selecionadoId={empresaSelecionada}
            aoSelecionar={(id) => {
              setEmpresaSelecionada(id);
              setCentroSelecionado(null);
              setArmazemSelecionado(null);
              setZonaSelecionada(null);
            }}
          />
        )}
      </Secao>

      {/* CENTRO DE DISTRIBUIÇÃO */}
      {empresaSelecionada && (
        <Secao titulo="Centros de Distribuição">
          <FormularioCentro empresaId={empresaSelecionada} onCriar={estrutura.criarCentro} />
          {centrosDaEmpresa.length === 0 ? (
            <EmptyState titulo="Nenhum centro de distribuição" descricao="Cadastre um centro de distribuição para esta empresa." />
          ) : (
            <ListaSelecionavel
              itens={centrosDaEmpresa.map((c) => ({ id: c.id, rotulo: `${c.nome} (${c.codigo})`, status: c.status }))}
              selecionadoId={centroSelecionado}
              aoSelecionar={(id) => {
                setCentroSelecionado(id);
                setArmazemSelecionado(null);
                setZonaSelecionada(null);
              }}
            />
          )}
        </Secao>
      )}

      {/* ARMAZÉM */}
      {centroSelecionado && (
        <Secao titulo="Armazéns">
          <FormularioArmazem centroId={centroSelecionado} onCriar={estrutura.criarArmazem} />
          {armazensDoCentro.length === 0 ? (
            <EmptyState titulo="Nenhum armazém" descricao="Cadastre um armazém para este centro de distribuição." />
          ) : (
            <ListaSelecionavel
              itens={armazensDoCentro.map((a) => ({ id: a.id, rotulo: `${a.nome} (${a.codigo})`, status: a.status }))}
              selecionadoId={armazemSelecionado}
              aoSelecionar={(id) => {
                setArmazemSelecionado(id);
                setZonaSelecionada(null);
              }}
            />
          )}
        </Secao>
      )}

      {/* ZONAS */}
      {armazemSelecionado && (
        <Secao titulo="Zonas">
          <FormularioZona armazemId={armazemSelecionado} onCriar={estrutura.criarZona} />
          {zonasDoArmazem.length === 0 ? (
            <EmptyState titulo="Nenhuma zona" descricao="Cadastre as zonas operacionais deste armazém (recebimento, picking, expedição etc.)." />
          ) : (
            <ListaSelecionavel
              itens={zonasDoArmazem.map((z) => ({ id: z.id, rotulo: `${rotuloTipoZona[z.tipo]} — ${z.nome}`, status: z.status }))}
              selecionadoId={zonaSelecionada}
              aoSelecionar={setZonaSelecionada}
            />
          )}
        </Secao>
      )}

      {/* ÁREAS + ENDEREÇOS */}
      {zonaSelecionada && (
        <Secao titulo="Áreas e Endereços">
          <FormularioArea zonaId={zonaSelecionada} onCriar={estrutura.criarArea} />
          {areasDaZona.length === 0 ? (
            <EmptyState titulo="Nenhuma área" descricao="Subdivida esta zona em áreas para depois cadastrar endereços." />
          ) : (
            <div className="flex flex-col gap-4">
              {areasDaZona.map((area) => (
                <div key={area.id} className="rounded-lg border border-mist p-4">
                  <p className="type-h3">{area.nome}</p>
                  <div className="mt-3">
                    <FormularioEndereco areaId={area.id} onCriar={estrutura.criarEndereco} />
                  </div>
                  {enderecosPorArea(area.id).length === 0 ? (
                    <p className="type-caption mt-3 text-steel">Nenhum endereço cadastrado nesta área.</p>
                  ) : (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {enderecosPorArea(area.id).map((end) => (
                        <span key={end.id} className="type-technical flex items-center gap-2 rounded-md bg-stone px-2 py-1">
                          {end.codigo}
                          <StatusBadge status={statusParaBadge(end.status)} />
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Secao>
      )}
    </div>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="type-h2">{titulo}</h2>
      {children}
    </section>
  );
}

function ListaSelecionavel({
  itens,
  selecionadoId,
  aoSelecionar,
}: {
  itens: { id: string; rotulo: string; status: StatusEstrutural }[];
  selecionadoId: string | null;
  aoSelecionar: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {itens.map((item) => (
        <button
          key={item.id}
          onClick={() => aoSelecionar(item.id)}
          className={`type-body-small flex items-center gap-2 rounded-md border px-3 py-2 ${
            selecionadoId === item.id ? "border-navy bg-stone" : "border-mist hover:bg-stone"
          }`}
        >
          {item.rotulo}
          <StatusBadge status={statusParaBadge(item.status)} />
        </button>
      ))}
    </div>
  );
}

function FormularioEmpresa({ onCriar }: { onCriar: (dados: { nome: string; status: StatusEstrutural }) => void }) {
  const [nome, setNome] = useState("");
  return (
    <form
      className="flex items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!nome.trim()) return;
        onCriar({ nome, status: "ativo" });
        setNome("");
      }}
    >
      <TextField label="Nome da empresa" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Degrade Barber House" />
      <Button type="submit">Adicionar</Button>
    </form>
  );
}

function FormularioCentro({
  empresaId,
  onCriar,
}: {
  empresaId: string;
  onCriar: (dados: { empresaId: string; nome: string; codigo: string; status: StatusEstrutural }) => void;
}) {
  const [nome, setNome] = useState("");
  const [codigo, setCodigo] = useState("");
  return (
    <form
      className="flex items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!nome.trim() || !codigo.trim()) return;
        onCriar({ empresaId, nome, codigo, status: "ativo" });
        setNome("");
        setCodigo("");
      }}
    >
      <TextField label="Nome do CD" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: CD Guaratiba" />
      <TextField label="Código" value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Ex: CD01" />
      <Button type="submit">Adicionar</Button>
    </form>
  );
}

function FormularioArmazem({
  centroId,
  onCriar,
}: {
  centroId: string;
  onCriar: (dados: { centroDistribuicaoId: string; nome: string; codigo: string; status: StatusEstrutural }) => void;
}) {
  const [nome, setNome] = useState("");
  const [codigo, setCodigo] = useState("");
  return (
    <form
      className="flex items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!nome.trim() || !codigo.trim()) return;
        onCriar({ centroDistribuicaoId: centroId, nome, codigo, status: "ativo" });
        setNome("");
        setCodigo("");
      }}
    >
      <TextField label="Nome do armazém" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Armazém A" />
      <TextField label="Código" value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Ex: AZ01" />
      <Button type="submit">Adicionar</Button>
    </form>
  );
}

function FormularioZona({
  armazemId,
  onCriar,
}: {
  armazemId: string;
  onCriar: (dados: { armazemId: string; tipo: TipoZona; nome: string; status: StatusEstrutural }) => void;
}) {
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<TipoZona>("armazenagem");
  return (
    <form
      className="flex items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!nome.trim()) return;
        onCriar({ armazemId, tipo, nome, status: "ativo" });
        setNome("");
      }}
    >
      <SelectField label="Tipo" value={tipo} onChange={(e) => setTipo(e.target.value as TipoZona)}>
        {TIPOS_ZONA.map((t) => (
          <option key={t} value={t}>
            {rotuloTipoZona[t]}
          </option>
        ))}
      </SelectField>
      <TextField label="Nome da zona" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Zona de Picking Principal" />
      <Button type="submit">Adicionar</Button>
    </form>
  );
}

function FormularioArea({ zonaId, onCriar }: { zonaId: string; onCriar: (dados: { zonaId: string; nome: string }) => void }) {
  const [nome, setNome] = useState("");
  return (
    <form
      className="flex items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!nome.trim()) return;
        onCriar({ zonaId, nome });
        setNome("");
      }}
    >
      <TextField label="Nome da área" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Corredor A" />
      <Button type="submit">Adicionar área</Button>
    </form>
  );
}

function FormularioEndereco({
  areaId,
  onCriar,
}: {
  areaId: string;
  onCriar: (dados: { areaId: string; codigo: string; status: StatusEstrutural }) => void;
}) {
  const [codigo, setCodigo] = useState("");
  return (
    <form
      className="flex items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!codigo.trim()) return;
        onCriar({ areaId, codigo, status: "ativo" });
        setCodigo("");
      }}
    >
      <TextField label="Código do endereço" value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Ex: A-03-14-02" />
      <Button type="submit" variant="secondary">
        Adicionar endereço
      </Button>
    </form>
  );
}
