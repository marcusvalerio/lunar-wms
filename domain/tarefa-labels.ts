import type { TipoTarefa, StatusTarefa, PrioridadeTarefa, TipoExcecao } from "@/domain/tarefa";

export const rotuloTipoTarefa: Record<TipoTarefa, string> = {
  recebimento: "Recebimento",
  putaway: "Put-away",
  reabastecimento: "Reabastecimento",
  picking: "Picking",
  packing: "Packing",
  inventario: "Inventário",
  transferencia: "Transferência",
  expedicao: "Expedição",
  devolucao: "Devolução",
};

export const rotuloStatusTarefa: Record<StatusTarefa, string> = {
  disponivel: "Disponível",
  em_execucao: "Em execução",
  concluida: "Concluída",
  bloqueada: "Bloqueada",
  cancelada: "Cancelada",
};

export function statusTarefaParaBadge(status: StatusTarefa) {
  switch (status) {
    case "disponivel":
      return "disponivel" as const;
    case "em_execucao":
      return "emOperacao" as const;
    case "concluida":
      return "concluido" as const;
    case "bloqueada":
      return "bloqueado" as const;
    case "cancelada":
      return "bloqueado" as const;
  }
}

export const rotuloPrioridadeTarefa: Record<PrioridadeTarefa, string> = {
  critica: "Crítica",
  alta: "Alta",
  normal: "Normal",
  baixa: "Baixa",
};

export const rotuloTipoExcecao: Record<TipoExcecao, string> = {
  produto_ausente: "Produto ausente",
  codigo_incorreto: "Código incorreto",
  estoque_insuficiente: "Estoque insuficiente",
  produto_avariado: "Produto avariado",
  endereco_bloqueado: "Endereço bloqueado",
  divergencia_quantidade: "Divergência de quantidade",
  tarefa_atrasada: "Tarefa atrasada",
  divergencia_packing: "Divergência de packing",
  divergencia_inventario: "Divergência de inventário",
};
