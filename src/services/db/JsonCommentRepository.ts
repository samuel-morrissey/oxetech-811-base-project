import { CommentRepository } from "../../core/repositories/CommentRepository";
import { TicketComment } from "../../types/types";
import { DatabaseManager } from "./DatabaseManager";

export class JsonCommentRepository implements CommentRepository {
  findByTicketId(ticketId: string): TicketComment[] {
    return DatabaseManager.getInstance()
      .getDatabase()
      .comments.filter((comment) => comment.ticketId === ticketId);
  }

  add(comment: TicketComment): void {
    const manager = DatabaseManager.getInstance();
    const database = manager.getDatabase();
    database.comments.push(comment);
    manager.saveDatabase(database);
  }
}
