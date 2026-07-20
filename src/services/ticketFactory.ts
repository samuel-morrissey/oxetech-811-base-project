import { ID, TICKET_STATUS } from "../constants";
import type { CreateTicketInput } from "../dtos/ticketDtos";
import type { Ticket, TicketComment } from "../types";
import { generateId } from "../utils/generateId";
import { resolvePriority } from "./priorityRules";

/**
 * Factory pattern: unico ponto que define o "shape default" de Ticket.
 * Adicionar um campo novo (ex.: sourceChannel) vira mudanca localizada.
 * Ver docs/DESIGN_PATTERNS.md#3-factory.
 */
export function makeTicket(input: CreateTicketInput, now: string): Ticket {
  return {
    id: generateId(ID.PREFIX.TICKET),
    title: input.title,
    description: input.description,
    category: input.category,
    requesterId: input.requesterId,
    assignedToId: input.assignedToId,
    status: TICKET_STATUS.OPEN,
    priority: resolvePriority({
      category: input.category,
      description: input.description,
    }),
    createdAt: now,
    updatedAt: now,
  };
}

export interface MakeCommentInput {
  ticketId: string;
  authorId: string;
  message: string;
}

/**
 * Factory pattern: centraliza id + timestamp de TicketComment.
 * Ver docs/DESIGN_PATTERNS.md#3-factory.
 */
export function makeComment(
  input: MakeCommentInput,
  now: string,
): TicketComment {
  return {
    id: generateId(ID.PREFIX.COMMENT),
    ticketId: input.ticketId,
    authorId: input.authorId,
    message: input.message,
    createdAt: now,
  };
}
