"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
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

/** Primeiro item com link — calculado uma vez, fora do render, sem mutação. */
const PRIMEIRO_ITEM_COM_HREF = SECOES_ADMIN.flatMap((s) => s.itens).find((item) => item.href);

function ListaNavegacao({
  pathname,
  aoNavegar,
  primeiroLinkRef,
}: {
  pathname: string;
  aoNavegar?: () => void;
  primeiroLinkRef?: React.RefObject<HTMLAnchorElement | null>;
}) {
  return (
    <nav className="flex flex-col gap-6">
      {SECOES_ADMIN.map((secao) => (
        <div key={secao.titulo}>
          <p className="type-label px-2 text-steel">{secao.titulo}</p>
          <ul className="mt-2 flex flex-col gap-1">
            {secao.itens.map((item) => {
              if (!item.href) {
                return (
                  <li key={item.rotulo} className="type-body-small cursor-not-allowed rounded-md px-2 py-1.5 text-steel opacity-50">
                    {item.rotulo}
                  </li>
                );
              }
              return (
                <li key={item.rotulo}>
                  <Link
                    ref={item === PRIMEIRO_ITEM_COM_HREF ? primeiroLinkRef : undefined}
                    href={item.href}
                    onClick={aoNavegar}
                    className={`type-body-small block rounded-md px-2 py-1.5 transition-colors duration-150 hover:bg-mist ${
                      pathname === item.href ? "bg-mist text-navy" : "text-ink"
                    }`}
                  >
                    {item.rotulo}
                  </Link>
                </li>
              );
            })}
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
  const botaoAbrirRef = useRef<HTMLButtonElement>(null);
  const primeiroLinkRef = useRef<HTMLAnchorElement>(null);

  // Fecha automaticamente ao trocar de rota — evita o drawer ficar
  // aberto por cima da tela seguinte depois de navegar. Ajuste durante
  // a renderização (não em efeito): compara com a rota do render
  // anterior e corrige antes de pintar, sem round-trip extra.
  const [pathnameAnterior, setPathnameAnterior] = useState(pathname);
  if (pathname !== pathnameAnterior) {
    setPathnameAnterior(pathname);
    if (menuAberto) setMenuAberto(false);
  }

  useEffect(() => {
    if (!menuAberto) return;
    primeiroLinkRef.current?.focus();

    function aoTeclar(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuAberto(false);
    }
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [menuAberto]);

  function fecharMenu() {
    setMenuAberto(false);
    botaoAbrirRef.current?.focus();
  }

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
            ref={botaoAbrirRef}
            type="button"
            aria-label="Abrir menu de navegação"
            aria-expanded={menuAberto}
            aria-controls="drawer-admin"
            onClick={() => setMenuAberto(true)}
            className="type-label min-h-[2.5rem] rounded-md border border-mist px-3 py-2 transition-colors duration-150 hover:bg-stone focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy md:hidden"
          >
            ☰ Menu
          </button>
          <ExperienceSwitcher />
        </header>
        <main className="flex-1 px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:px-6 md:py-8">{children}</main>
      </div>

      {/* Drawer mobile — sempre montado para poder animar a saída, não só a entrada. */}
      <div
        aria-hidden={!menuAberto}
        className={`fixed inset-0 z-50 bg-ink/40 transition-opacity duration-200 md:hidden ${
          menuAberto ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={fecharMenu}
      />
      <div
        id="drawer-admin"
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
        aria-hidden={!menuAberto}
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-y-auto bg-paper px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] shadow-lg transition-transform duration-200 ease-out md:hidden ${
          menuAberto ? "translate-x-0" : "pointer-events-none -translate-x-full"
        }`}
      >
        <div className="mb-6 flex items-center justify-between px-2">
          <div className="flex items-baseline gap-2">
            <span className="type-h3 text-navy">LUNAR</span>
            <span className="type-metadata text-steel">Admin</span>
          </div>
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={fecharMenu}
            className="type-label min-h-[2.5rem] min-w-[2.5rem] rounded-md px-2 py-1 transition-colors duration-150 hover:bg-stone focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
          >
            ✕
          </button>
        </div>
        <ListaNavegacao pathname={pathname} aoNavegar={fecharMenu} primeiroLinkRef={primeiroLinkRef} />
      </div>
    </div>
  );
}
