export const TICKET_STATUSES = [
  "open",
  "in_progress",
  "resolved",
  "closed",
] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];

const ticketStatusSet = new Set<string>(TICKET_STATUSES);

export function isValidTicketStatus(
  value: string,
): value is TicketStatus {
  return ticketStatusSet.has(value);
}
