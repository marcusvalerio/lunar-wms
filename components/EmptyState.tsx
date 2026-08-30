export function EmptyState({ titulo, descricao }: { titulo: string; descricao: string }) {
  return (
    <div className="flex flex-col items-start gap-1 rounded-lg border border-dashed border-mist px-5 py-6">
      <p className="type-h3">{titulo}</p>
      <p className="type-body-small text-steel">{descricao}</p>
    </div>
  );
}
