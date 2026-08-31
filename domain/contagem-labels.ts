import type { StatusContagem } from "@/domain/contagem";

export const rotuloStatusContagem: Record<StatusContagem, string> = {
  pendente: "Pendente",
  divergente: "Divergência",
  recontagem: "Recontagem",
  aguardando_aprovacao: "Aguardando aprovação",
  concluida: "Concluída",
};

export function statusContagemParaBadge(status: StatusContagem) {
  switch (status) {
    case "pendente":
      return "pendente" as const;
    case "divergente":
      return "divergencia" as const;
    case "recontagem":
    case "aguardando_aprovacao":
      return "emProcesso" as const;
    case "concluida":
      return "concluido" as const;
  }
}
