"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExperienceSwitcher } from "./ExperienceSwitcher";

/**
 * Itens com `href` navegam para módulos já implementados.
 * Itens sem `href` aparecem desabilitados — ainda não existem (anti-fake, item 96).
 */
const SECOES_ADMIN: { titulo: string; itens: { rotulo: string; href?: string }[] }[] = [
  { titulo: "Acesso", itens: [{ rotulo: "Usuários, perfis, permissões e escopos", href: "/admin/acesso" }] },
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
  { titulo: "Operação", itens: [{ rotulo: "Recebimento", href: "/admin/recebimento" }, { rotulo: "Packing", href: "/admin/packing" }] },
  { titulo: "Inventário", itens: [{ rotulo: "Contagem de inventário", href: "/admin/inventario" }] },
  {
    titulo: "Devoluções & Cross-docking",
    itens: [
      { rotulo: "Devoluções", href: "/admin/devolucoes" },
      { rotulo: "Cross-docking", href: "/admin/cross-docking" },
    ],
  },
  { titulo: "Configuração", itens: [{ rotulo: "Estratégias e regras", href: "/admin/configuracoes" }] },
  { titulo: "Governança", itens: [{ rotulo: "Atividades", href: "/admin/atividades" }] },
];

function ListaNavegacao({ pathname, aoNavegar }: { pathname: string; aoNavegar?: () => void }) {
  return (
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
                    onClick={aoNavegar}
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
  );
}

/**
 * Shell administrativo — GOVERNANÇA. Irmã do LunarWorkspace, não um
 * produto separado (item 56 do spec).
 *
 * Desktop: rail fixo à esquerda. Mobile: cabeçalho compacto com um
 * drawer para navegação (item 50/55 do spec — mobile não é desktop
 * encolhido, e não expõe todo item de navegação do desktop).
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 flex-col border-r border-mist bg-stone px-4 py-6 md:flex">
        <div className="mb-8 flex items-baseline gap-2 px-2">
          <span className="type-h3 text-navy">LUNAR</span>
          <span className="type-metadata text-steel">Admin</span>
        </div>
        <ListaNavegacao pathname={pathname} />
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-mist px-4 py-3 md:justify-end md:px-6 md:py-4">
          <button
            type="button"
            aria-label="Abrir menu de navegação"
            onClick={() => setMenuAberto(true)}
            className="type-label rounded-md border border-mist px-3 py-2 md:hidden"
          >
            ☰ Menu
          </button>
          <ExperienceSwitcher />
        </header>
        <main className="flex-1 px-4 py-6 md:px-6 md:py-8">{children}</main>
      </div>

      {menuAberto && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            className="flex-1 bg-ink/40"
            onClick={() => setMenuAberto(false)}
          />
          <div className="flex w-72 flex-col overflow-y-auto bg-paper px-4 py-6">
            <div className="mb-6 flex items-center justify-between px-2">
              <div className="flex items-baseline gap-2">
                <span className="type-h3 text-navy">LUNAR</span>
                <span className="type-metadata text-steel">Admin</span>
              </div>
              <button type="button" aria-label="Fechar menu" onClick={() => setMenuAberto(false)} className="type-label px-2 py-1">
                ✕
              </button>
            </div>
            <ListaNavegacao pathname={pathname} aoNavegar={() => setMenuAberto(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
