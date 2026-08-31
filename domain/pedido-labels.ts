import type { StatusPedido, PrioridadePedido } from "@/domain/pedido";

export const rotuloStatusPedido: Record<StatusPedido, string> = {
  recebido: "Recebido",
  analise: "Em análise",
  reservado: "Reservado",
  alocado: "Alocado",
  planejado: "Planejado",
  picking: "Picking",
  conferencia: "Conferência",
  packing: "Packing",
  expedicao: "Expedição",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

/** Mapeia o status do pedido para uma chave do sistema unificado de status (item 61 do spec). */
export function statusPedidoParaBadge(status: StatusPedido) {
  switch (status) {
    case "recebido":
    case "analise":
      return "pendente" as const;
    case "reservado":
    case "alocado":
    case "planejado":
    case "picking":
    case "conferencia":
    case "packing":
    case "expedicao":
      return "emProcesso" as const;
    case "concluido":
      return "concluido" as const;
    case "cancelado":
      return "bloqueado" as const;
  }
}

export const rotuloPrioridade: Record<PrioridadePedido, string> = {
  critica: "Crítica",
  alta: "Alta",
  normal: "Normal",
  baixa: "Baixa",
};
