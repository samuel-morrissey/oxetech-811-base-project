import type { Ticket } from "../features/tickets/types/ticket.js";
import type { TicketComment } from "../features/tickets/types/ticket-comment.js";
import type { User } from "../features/users/types/user.js";

export interface Database {
  users: User[];
  tickets: Ticket[];
  comments: TicketComment[];
}
