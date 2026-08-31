"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { DocumentoRecebimento, ItemRecebimento } from "@/domain/recebimento";
import { gerarId } from "./repository";

/**
 * Este repositório fica deliberadamente desacoplado do motor de tarefas
 * e do motor de estoque — a orquestração entre os três acontece na tela
 * (app/admin/recebimento/page.tsx), do mesmo jeito que Fase 4 orquestrou
 * Pedidos + Estoque. Cada domínio continua responsável só pelo seu
 * próprio estado.
 */
interface RepositorioRecebimento {
  documentos: DocumentoRecebimento[];

  criarDocumento(numero: string, itens: { produtoId: string; quantidadeEsperada: number }[]): void;

  conferirItem(documentoId: string, itemId: string, dados: { quantidadeRecebida: number; lote?: string; validade?: string }): void;

  aprovarDocumento(documentoId: string): void;

  vincularTarefaPutaway(documentoId: string, itemId: string, tarefaId: string): void;

  concluirItem(documentoId: string, itemId: string, enderecoDestinoId: string): void;
}

const RecebimentoContext = createContext<RepositorioRecebimento | null>(null);

export function ReceivingStoreProvider({ children }: { children: ReactNode }) {
  const [documentos, setDocumentos] = useState<DocumentoRecebimento[]>([]);

  function criarDocumento(numero: string, itens: { produtoId: string; quantidadeEsperada: number }[]) {
    const documentoId = gerarId("recebimento");
    const itensCriados: ItemRecebimento[] = itens.map((item) => ({
      id: gerarId("item_receb"),
      documentoId,
      produtoId: item.produtoId,
      quantidadeEsperada: item.quantidadeEsperada,
      status: "pendente",
    }));

    setDocumentos((prev) => [
      ...prev,
      { id: documentoId, numero, status: "aberto", criadoEm: new Date().toISOString(), itens: itensCriados },
    ]);
  }

  function conferirItem(documentoId: string, itemId: string, dados: { quantidadeRecebida: number; lote?: string; validade?: string }) {
    setDocumentos((prev) =>
      prev.map((doc) => {
        if (doc.id !== documentoId) return doc;
        const itens = doc.itens.map((item) =>
          item.id === itemId
            ? { ...item, status: "conferido" as const, quantidadeRecebida: dados.quantidadeRecebida, lote: dados.lote, validade: dados.validade }
            : item
        );
        return { ...doc, itens, status: "em_conferencia" as const };
      })
    );
  }

  function aprovarDocumento(documentoId: string) {
    setDocumentos((prev) => prev.map((doc) => (doc.id === documentoId ? { ...doc, status: "aprovado" as const } : doc)));
  }

  function vincularTarefaPutaway(documentoId: string, itemId: string, tarefaId: string) {
    setDocumentos((prev) =>
      prev.map((doc) => {
        if (doc.id !== documentoId) return doc;
        const itens = doc.itens.map((item) =>
          item.id === itemId ? { ...item, status: "aguardando_putaway" as const, tarefaPutawayId: tarefaId } : item
        );
        return { ...doc, itens };
      })
    );
  }

  function concluirItem(documentoId: string, itemId: string, enderecoDestinoId: string) {
    setDocumentos((prev) =>
      prev.map((doc) => {
        if (doc.id !== documentoId) return doc;
        const itens = doc.itens.map((item) =>
          item.id === itemId ? { ...item, status: "concluido" as const, enderecoDestinoId } : item
        );
        const todosConcluidos = itens.every((item) => item.status === "concluido");
        return { ...doc, itens, status: todosConcluidos ? ("concluido" as const) : doc.status };
      })
    );
  }

  const value: RepositorioRecebimento = {
    documentos,
    criarDocumento,
    conferirItem,
    aprovarDocumento,
    vincularTarefaPutaway,
    concluirItem,
  };

  return <RecebimentoContext.Provider value={value}>{children}</RecebimentoContext.Provider>;
}

export function useRecebimento(): RepositorioRecebimento {
  const ctx = useContext(RecebimentoContext);
  if (!ctx) throw new Error("useRecebimento deve ser usado dentro de um ReceivingStoreProvider");
  return ctx;
}
