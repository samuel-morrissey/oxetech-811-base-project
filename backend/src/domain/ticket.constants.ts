export const VALID_TICKET_STATUSES = ["open", "in_progress", "resolved", "closed"] as const;
export const VALID_TICKET_CATEGORIES = ["infra", "sistemas", "academico"] as const;

export type TicketCategory = typeof VALID_TICKET_CATEGORIES[number];
