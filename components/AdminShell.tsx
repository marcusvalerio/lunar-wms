"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExperienceSwitcher } from "./ExperienceSwitcher";

/**
 * Itens com `href` navegam para módulos já implementados.
 * Itens sem `href` aparecem desabilitados — ainda não existem (anti-fake, item 96).
 */
const SECOES_ADMIN: { titulo: string; itens: { rotulo: string; href?: string }[] }[] = [
  { titulo: "Acesso", itens: [{ rotulo: "Usuários" }, { rotulo: "Perfis" }, { rotulo: "Permissões" }, { rotulo: "Escopos" }] },
  {
    titulo: "Estrutura",
    itens: [
      { rotulo: "Empresas, CDs, Armazéns, Zonas, Áreas e Endereços", href: "/admin/estrutura" },
    ],
  },
  { titulo: "Catálogo", itens: [{ rotulo: "Produtos", href: "/admin/produtos" }] },
  { titulo: "Estoque", itens: [{ rotulo: "Posições, entradas e reservas", href: "/admin/estoque" }] },
  { titulo: "Pedidos", itens: [{ rotulo: "Pedidos e alocação", href: "/admin/pedidos" }] },
  { titulo: "Tarefas", itens: [{ rotulo: "Motor de tarefas", href: "/admin/tarefas" }] },
  { titulo: "Configuração", itens: [{ rotulo: "Capacidades" }, { rotulo: "Regras" }, { rotulo: "Segmentos" }] },
  { titulo: "Governança", itens: [{ rotulo: "Atividades" }, { rotulo: "Auditoria" }] },
];

/**
 * Shell administrativo — GOVERNANÇA. Irmã do LunarWorkspace, não um
 * produto separado (item 56 do spec).
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

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
                {secao.itens.map((item) =>
                  item.href ? (
                    <li key={item.rotulo}>
                      <Link
                        href={item.href}
                        className={`type-body-small block rounded-md px-2 py-1.5 hover:bg-mist ${
                          pathname === item.href ? "bg-mist text-navy" : "text-ink"
                        }`}
                      >
                        {item.rotulo}
                      </Link>
                    </li>
                  ) : (
                    <li key={item.rotulo} className="type-body-small cursor-not-allowed rounded-md px-2 py-1.5 text-steel opacity-50">
                      {item.rotulo}
                    </li>
                  )
                )}
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
