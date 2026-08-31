import type { StatusDocumentoRecebimento, StatusItemRecebimento } from "@/domain/recebimento";

export const rotuloStatusDocumento: Record<StatusDocumentoRecebimento, string> = {
  aberto: "Aberto",
  em_conferencia: "Em conferência",
  aprovado: "Aprovado",
  concluido: "Concluído",
};

export function statusDocumentoParaBadge(status: StatusDocumentoRecebimento) {
  switch (status) {
    case "aberto":
      return "pendente" as const;
    case "em_conferencia":
      return "emProcesso" as const;
    case "aprovado":
      return "emProcesso" as const;
    case "concluido":
      return "concluido" as const;
  }
}

export const rotuloStatusItem: Record<StatusItemRecebimento, string> = {
  pendente: "Pendente",
  conferido: "Conferido",
  aguardando_putaway: "Aguardando put-away",
  concluido: "Concluído",
};
