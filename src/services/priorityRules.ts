import { PRIORITY_RULES, TICKET_CATEGORY, TICKET_PRIORITY } from "../constants";
import type { TicketPriority } from "../types";

export interface PriorityInput {
  category: string;
  description: string;
}

export interface PriorityRule {
  matches(input: PriorityInput): boolean;
  priority: TicketPriority;
}

/**
 * Strategy pattern: cada regra e uma estrategia independente. A ordem do array
 * define a precedencia (primeiro match ganha). Adicionar uma regra = novo item,
 * sem alterar callers. Ver docs/DESIGN_PATTERNS.md#1-strategy.
 */
export const priorityRules: PriorityRule[] = [
  {
    matches: ({ category, description }) =>
      category === TICKET_CATEGORY.INFRA ||
      description.toLowerCase().includes(PRIORITY_RULES.URGENT_KEYWORD),
    priority: TICKET_PRIORITY.URGENT,
  },
  {
    matches: ({ category, description }) =>
      category === TICKET_CATEGORY.SISTEMAS ||
      description.length > PRIORITY_RULES.LONG_DESCRIPTION_THRESHOLD,
    priority: TICKET_PRIORITY.HIGH,
  },
  {
    matches: ({ category }) => category === TICKET_CATEGORY.ACADEMICO,
    priority: TICKET_PRIORITY.MEDIUM,
  },
];

/**
 * Strategy pattern: itera as estrategias em ordem, retorna a prioridade da
 * primeira que casa; fallback LOW. Ver docs/DESIGN_PATTERNS.md#1-strategy.
 */
export function resolvePriority(input: PriorityInput): TicketPriority {
  return (
    priorityRules.find((rule) => rule.matches(input))?.priority ??
    TICKET_PRIORITY.LOW
  );
}
