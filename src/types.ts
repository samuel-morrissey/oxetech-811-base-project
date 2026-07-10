export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export type TicketPriority = "low" | "medium" | "high" | "urgent";

export type UserRole = "student" | "teacher" | "support";

export const VALID_STATUSES: TicketStatus[] = ["open", "in_progress", "resolved", "closed"];

export const VALID_CATEGORIES = ["infra", "sistemas", "academico"] as const;

export type TicketCategory = (typeof VALID_CATEGORIES)[number];

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  authorId: string;
  message: string;
  createdAt: string;
}

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

export interface Database {
  users: User[];
  tickets: Ticket[];
  comments: TicketComment[];
}