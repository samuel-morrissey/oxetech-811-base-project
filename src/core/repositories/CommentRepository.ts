import { TicketComment } from "../../types/types";

export interface CommentRepository {
  findByTicketId(ticketId: string): TicketComment[];
  add(comment: TicketComment): void;
}
