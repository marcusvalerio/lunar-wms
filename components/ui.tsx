import type { ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes } from "react";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" }) {
  const base = "type-label rounded-md px-3 py-2 transition-colors disabled:opacity-40";
  const estilos =
    variant === "primary"
      ? "bg-navy text-paper hover:bg-ink"
      : "bg-transparent text-steel border border-mist hover:bg-stone";
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
        className={`type-body-small rounded-md border border-mist bg-paper px-3 py-2 text-ink outline-none focus:border-steel ${className}`}
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
        className={`type-body-small rounded-md border border-mist bg-paper px-3 py-2 text-ink outline-none focus:border-steel ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
