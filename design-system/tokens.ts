/**
 * LUNAR — Design Tokens
 *
 * Fonte única de verdade para cor, tipografia, espaçamento e densidade.
 * Nada na aplicação deve usar valores de cor/fonte "soltos" — tudo passa
 * por aqui (ou pelas variáveis CSS geradas a partir daqui em globals.css).
 */

export const color = {
  // Superfícies minerais — nunca preto ou branco puro
  paper: "#F4F2EC", // Warm Paper — superfície base
  stone: "#E9E7E0", // Soft Stone — superfície secundária
  mist: "#DFE1DD", // Mist — bordas, divisores

  ink: "#263640", // Deep Ink — texto principal, superfícies escuras
  navy: "#19344A", // Lunar Navy — ênfase estrutural, navegação
  steel: "#496A7C", // Steel Blue — texto secundário, ícones

  amber: "#D79A3B", // Signal Amber — atenção, alerta médio
  green: "#159B82", // Operational Green — sucesso, disponível
  red: "#D95F5F", // Operational Red — erro, bloqueado, crítico
} as const;

export const status = {
  disponivel: color.green,
  emOperacao: color.steel,
  pendente: color.amber,
  emProcesso: color.navy,
  concluido: color.green,
  atencao: color.amber,
  divergencia: color.red,
  bloqueado: color.red,
  erro: color.red,
} as const;

export const priority = {
  critica: color.red,
  alta: color.amber,
  normal: color.steel,
  baixa: color.mist,
} as const;

/**
 * Papéis tipográficos explícitos. Cada um mapeia para uma fonte, peso e
 * escala definidos — nenhuma página escolhe fonte/tamanho livremente.
 */
export const typeRole = {
  display: { font: "familjen", weight: 600, size: "3rem", lineHeight: 1.05 },
  h1: { font: "familjen", weight: 600, size: "2rem", lineHeight: 1.1 },
  h2: { font: "familjen", weight: 600, size: "1.5rem", lineHeight: 1.2 },
  h3: { font: "familjen", weight: 500, size: "1.125rem", lineHeight: 1.3 },
  body: { font: "sora", weight: 400, size: "0.9375rem", lineHeight: 1.5 },
  bodySmall: { font: "sora", weight: 400, size: "0.8125rem", lineHeight: 1.45 },
  label: { font: "sora", weight: 500, size: "0.75rem", lineHeight: 1.3, tracking: "0.03em" },
  caption: { font: "sora", weight: 400, size: "0.6875rem", lineHeight: 1.3 },
  metadata: { font: "sora", weight: 400, size: "0.6875rem", lineHeight: 1.3, tracking: "0.02em" },
  data: { font: "familjen", weight: 500, size: "1.25rem", lineHeight: 1.1 },
  technical: { font: "sora", weight: 400, size: "0.8125rem", lineHeight: 1.4 },
} as const;

export type TypeRole = keyof typeof typeRole;

/**
 * Densidade — cada experiência hierárquica tem uma densidade de
 * informação/ação diferente. Não é só "espaçamento menor", é uma
 * postura de produto (ver experience/roles.ts).
 */
export const density = {
  operacional: { padding: "0.75rem", gap: "0.5rem", controlHeight: "3rem" },
  supervisao: { padding: "1rem", gap: "0.75rem", controlHeight: "2.5rem" },
  tatico: { padding: "1.25rem", gap: "1rem", controlHeight: "2.25rem" },
  gestao: { padding: "1.5rem", gap: "1.25rem", controlHeight: "2.25rem" },
  administracao: { padding: "1.25rem", gap: "1rem", controlHeight: "2.25rem" },
} as const;

export const radius = {
  sm: "0.25rem",
  md: "0.5rem",
  lg: "0.75rem",
} as const;

export const breakpoint = {
  mobileSmall: "360px",
  mobileLarge: "480px",
  tablet: "768px",
  desktop: "1024px",
  wide: "1440px",
} as const;
