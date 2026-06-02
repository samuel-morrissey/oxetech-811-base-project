export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export type TicketPriority = "low" | "medium" | "high" | "urgent";

export type UserRole = "student" | "teacher" | "support";

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

export interface TicketListFilters {
  status?: string;
  category?: string;
  search?: string;
}

export interface TicketListItem extends Ticket {
  requester?: User;
  assigned?: User;
  commentsCount: number;
}

export interface TicketCommentWithAuthor extends TicketComment {
  author?: User;
}

export interface TicketDetail extends Ticket {
  requester?: User;
  assigned?: User;
  comments: TicketCommentWithAuthor[];
}

export type CreateTicketErrorCode = "invalid_requester";

export interface CreateTicketError {
  code: CreateTicketErrorCode;
}

export type CreateTicketResult =
  | { success: true; ticket: Ticket }
  | { success: false; error: CreateTicketError };

export type UpdateTicketStatusErrorCode = "not_found" | "comment_required_to_close";

export interface UpdateTicketStatusError {
  code: UpdateTicketStatusErrorCode;
}

export type UpdateTicketStatusResult =
  | { success: true; ticket: Ticket }
  | { success: false; error: UpdateTicketStatusError };

export type AddTicketCommentErrorCode = "not_found";

export interface AddTicketCommentError {
  code: AddTicketCommentErrorCode;
}

export type AddTicketCommentResult =
  | { success: true; comment: TicketComment }
  | { success: false; error: AddTicketCommentError };