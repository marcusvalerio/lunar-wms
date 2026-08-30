/**
 * LUNAR — Abstração Central de Experiência
 *
 * IMPORTANTE: isto NÃO é autenticação. É um mecanismo de validação de
 * produto (item 7/8 do spec). No futuro, `selectedRole` será substituído
 * por `authenticatedUser.role` sem reescrever a aplicação — por isso
 * nenhuma página deve importar um "papel fixo": tudo passa pelo
 * ExperienceProvider (ver experience/provider.tsx).
 */

export type Experiencia =
  | "administracao"
  | "gestao"
  | "tatico"
  | "supervisao"
  | "operacional";

export const EXPERIENCIAS: readonly Experiencia[] = [
  "administracao",
  "gestao",
  "tatico",
  "supervisao",
  "operacional",
] as const;

export const experienciaLabel: Record<Experiencia, string> = {
  administracao: "Administração",
  gestao: "Gestão",
  tatico: "Tático",
  supervisao: "Supervisão",
  operacional: "Operacional",
};

/** Modelo mental de cada experiência — usado para orientar toda decisão de UX. */
export const experienciaModeloMental: Record<Experiencia, string> = {
  administracao: "GOVERNAR",
  gestao: "ENTENDER + DECIDIR",
  tatico: "ORGANIZAR + PLANEJAR",
  supervisao: "CONTROLAR",
  operacional: "EXECUTAR",
};

/** A pergunta central que cada experiência precisa responder. */
export const experienciaPergunta: Record<Experiencia, string> = {
  administracao: "O que estou governando?",
  gestao: "Como minha operação está performando?",
  tatico: "Como devo organizar a operação?",
  supervisao: "Onde a operação precisa de mim agora?",
  operacional: "O que eu faço agora?",
};

/** Qual shell (item 56 do spec) cada experiência utiliza. */
export function shellDaExperiencia(exp: Experiencia): "workspace" | "admin" {
  return exp === "administracao" ? "admin" : "workspace";
}
