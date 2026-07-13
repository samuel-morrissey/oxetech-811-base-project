import { TicketComment } from "../../types/types";

export interface CommentRepository {
  findByTicketId(ticketId: string): Promise<TicketComment[]>;
  findById(id: string): Promise<TicketComment | undefined>;
  add(comment: TicketComment): Promise<void>;
  update(comment: TicketComment): Promise<void>;
}
