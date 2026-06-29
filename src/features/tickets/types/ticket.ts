import type { TicketStatus } from "./ticket-status.js";

export type TicketPriority = "low" | "medium" | "high" | "urgent";

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string;
  status: TicketStatus;
  priority: TicketPriority;
  requesterId: string;
  assignedToId?: string;
  createdAt: string;
  updatedAt: string;
}
