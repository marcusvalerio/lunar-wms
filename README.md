# LUNAR WMS

Sistema operacional digital para o armazém. Não é um dashboard genérico de
SaaS com terminologia de logística colada em cima — é um produto único que
combina estrutura, estoque, planejamento, orquestração de tarefas, execução,
supervisão, gestão e governança.

## Estado atual — Fase 1: Foundation

Esta é uma reconstrução do zero. O que existe hoje:

- **Design tokens** (`design-system/tokens.ts` + `app/globals.css`) — paleta
  mineral própria (sem preto/branco puro), papéis tipográficos explícitos
  (Familjen Grotesk para display/headings, Sora para UI), densidade por
  experiência.
- **Domínio (fundação)** (`domain/`) — modelos de estrutura física do
  armazém, produto, estoque (com ledger de movimentos), pedido (com
  reserva/alocação separadas de estoque físico) e o motor de tarefas.
  Apenas forma — sem lógica operacional ou persistência ainda.
- **Abstração de experiência** (`experience/`) — os cinco níveis
  hierárquicos (Administração, Gestão, Tático, Supervisão, Operacional),
  cada um com seu modelo mental e pergunta central. `selectedRole` hoje;
  será substituído por `authenticatedUser.role` no futuro sem reescrever
  a aplicação.
- **Shells** (`components/AdminShell.tsx`, `components/LunarWorkspace.tsx`)
  — dois shells irmãos, não produtos separados.
- **Componentes base** — `StatusBadge` (nunca depende só de cor),
  `EmptyState` (honesto sobre ausência de dados), `ExperienceSwitcher`
  (mecanismo de validação de produto, explicitamente não é autenticação).

## O que NÃO existe ainda (intencional)

- Autenticação/login real — usa o seletor de experiência.
- Qualquer módulo operacional (recebimento, picking, packing, expedição
  etc.) — vêm nas próximas fases.
- Persistência (Supabase) — o domínio está pronto para receber isso, mas
  nada é salvo ainda.
- Mapa espacial do armazém.
- Dados de demonstração — não há dados fake nesta fase; tudo que aparece
  na UI é estado real da aplicação (vazio) ou o próprio design system.

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS v4.

## Rodando localmente

```bash
npm install
npm run dev
```
