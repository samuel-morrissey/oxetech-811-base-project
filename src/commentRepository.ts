import { readDatabase, writeDatabase } from "./database";
import type { TicketComment } from "./types";

export function findCommentsByTicketId(ticketId: string): TicketComment[] {
  const database = readDatabase();
  return database.comments.filter((comment) => comment.ticketId === ticketId);
}

export function saveComment(comment: TicketComment): void {
  const database = readDatabase();
  database.comments.push(comment);
  writeDatabase(database);
}
