import type { ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, ReactNode, ThHTMLAttributes, TdHTMLAttributes } from "react";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" }) {
  const base =
    "type-label min-h-[2.5rem] rounded-md px-3 py-2 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 focus-visible:ring-offset-paper";
  const estilos =
    variant === "primary"
      ? "bg-navy text-paper hover:bg-ink"
      : "bg-transparent text-steel border border-mist hover:bg-stone hover:text-ink";
  return <button className={`${base} ${estilos} ${className}`} {...props} />;
}

export function TextField({
  label,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="type-label text-steel">{label}</span>
      <input
        className={`type-body-small min-h-[2.5rem] rounded-md border border-mist bg-paper px-3 py-2 text-ink outline-none transition-colors duration-150 focus:border-steel focus-visible:ring-2 focus-visible:ring-navy/30 ${className}`}
        {...props}
      />
    </label>
  );
}

export function SelectField({
  label,
  children,
  className = "",
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="type-label text-steel">{label}</span>
      <select
        className={`type-body-small min-h-[2.5rem] rounded-md border border-mist bg-paper px-3 py-2 text-ink outline-none transition-colors duration-150 focus:border-steel focus-visible:ring-2 focus-visible:ring-navy/30 ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

/** Célula de cabeçalho compartilhada — evita repetir o mesmo componente em cada tela com tabela. */
export function Th({ children, className = "", ...props }: ThHTMLAttributes<HTMLTableCellElement> & { children?: ReactNode }) {
  return (
    <th className={`type-label px-4 py-3 text-left text-steel ${className}`} {...props}>
      {children}
    </th>
  );
}

/** Célula de dados compartilhada — mesma razão do Th acima. */
export function Td({ children, className = "", ...props }: TdHTMLAttributes<HTMLTableCellElement> & { children: ReactNode }) {
  return (
    <td className={`px-4 py-3 ${className}`} {...props}>
      {children}
    </td>
  );
}
