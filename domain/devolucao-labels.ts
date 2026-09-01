import type { MotivoDevolucao, CondicaoProduto, DecisaoDevolucao, StatusDevolucao } from "@/domain/devolucao";

export const rotuloMotivoDevolucao: Record<MotivoDevolucao, string> = {
  avaria: "Avaria",
  divergencia_pedido: "Divergência do pedido",
  insatisfacao_cliente: "Insatisfação do cliente",
  produto_incorreto: "Produto incorreto",
  outro: "Outro",
};

export const rotuloCondicao: Record<CondicaoProduto, string> = {
  boa: "Boa — pode voltar ao estoque",
  avariada: "Avariada",
  impropria_para_venda: "Imprópria para venda",
};

export const rotuloDecisao: Record<DecisaoDevolucao, string> = {
  estoque: "Retornar ao estoque",
  quarentena: "Quarentena",
  descarte: "Descarte",
};

export const rotuloStatusDevolucao: Record<StatusDevolucao, string> = {
  recebida: "Recebida",
  em_inspecao: "Em inspeção",
  decidida: "Decidida",
  concluida: "Concluída",
};

export function statusDevolucaoParaBadge(status: StatusDevolucao) {
  switch (status) {
    case "recebida":
      return "pendente" as const;
    case "em_inspecao":
    case "decidida":
      return "emProcesso" as const;
    case "concluida":
      return "concluido" as const;
  }
}
