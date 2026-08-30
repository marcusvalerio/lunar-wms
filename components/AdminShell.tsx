"use client";

import type { ReactNode } from "react";
import { ExperienceSwitcher } from "./ExperienceSwitcher";

const SECOES_ADMIN = [
  { titulo: "Acesso", itens: ["Usuários", "Perfis", "Permissões", "Escopos"] },
  { titulo: "Estrutura", itens: ["Ambientes", "Centros", "Armazéns", "Zonas", "Áreas", "Endereços"] },
  { titulo: "Configuração", itens: ["Capacidades", "Regras", "Segmentos"] },
  { titulo: "Governança", itens: ["Atividades", "Auditoria"] },
];

/**
 * Shell administrativo — GOVERNANÇA. Irmã do LunarWorkspace, não um
 * produto separado (item 56 do spec).
 */
export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 flex-col border-r border-mist bg-stone px-4 py-6 md:flex">
        <div className="mb-8 flex items-baseline gap-2 px-2">
          <span className="type-h3 text-navy">LUNAR</span>
          <span className="type-metadata text-steel">Admin</span>
        </div>
        <nav className="flex flex-col gap-6">
          {SECOES_ADMIN.map((secao) => (
            <div key={secao.titulo}>
              <p className="type-label px-2 text-steel">{secao.titulo}</p>
              <ul className="mt-2 flex flex-col gap-1">
                {secao.itens.map((item) => (
                  <li key={item} className="type-body-small rounded-md px-2 py-1.5 text-ink hover:bg-mist">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-end border-b border-mist px-6 py-4">
          <ExperienceSwitcher />
        </header>
        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
