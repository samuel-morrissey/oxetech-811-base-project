import {
  TICKET_STATUSES,
  type TicketStatus,
} from "../types/ticket-status.js";

export { TICKET_STATUSES, type TicketStatus };

const ticketStatusSet = new Set<string>(TICKET_STATUSES);

export function isValidTicketStatus(
  value: string,
): value is TicketStatus {
  return ticketStatusSet.has(value);
}
