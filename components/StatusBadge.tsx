import { status } from "@/design-system/tokens";

type ChaveStatus = keyof typeof status;

const rotuloStatus: Record<ChaveStatus, string> = {
  disponivel: "Disponível",
  emOperacao: "Em operação",
  pendente: "Pendente",
  emProcesso: "Em processo",
  concluido: "Concluído",
  atencao: "Atenção",
  divergencia: "Divergência",
  bloqueado: "Bloqueado",
  erro: "Erro",
};

export function StatusBadge({ status: chave }: { status: ChaveStatus }) {
  const cor = status[chave];
  return (
    <span
      className="type-label inline-flex items-center gap-1.5 rounded-md px-2 py-1"
      style={{ backgroundColor: `${cor}1a`, color: cor }}
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cor }} />
      {rotuloStatus[chave]}
    </span>
  );
}
