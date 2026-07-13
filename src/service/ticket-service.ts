import fs from "node:fs";
import path from "node:path";
import type { Database, Ticket, TicketStatus } from "../types";

const dataFile = process.env.DATA_FILE || "data/db.json";
const databasePath = path.resolve(process.cwd(), dataFile);

function writeDatabase(database: Database) {
  fs.writeFileSync(databasePath, JSON.stringify(database, null, 2));
}

export function generateId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

enum Category {
  Infra = "infra",
  Sistemas = "sistemas",
  Academico = "academico",
}

enum TicketPriority {
  Urgent = "urgent",
  High = "high",
  Medium = "medium",
  Low = "low",
}

enum Description {
  DESCRIPTION_LENGTH_THRESHOLD = 220
}

export function calculatePriority(category: Category, description: string): TicketPriority {
  if (category === Category.Infra || description.toLowerCase().includes("urgente")) {
    return TicketPriority.Urgent;
  }

  if (category === Category.Sistemas || description.length > Description.DESCRIPTION_LENGTH_THRESHOLD) {
    return TicketPriority.High;
  }

  if (category === Category.Academico) {
    return TicketPriority.Medium;
  }

  return TicketPriority.Low;
}

export function getTicketsSummary(tickets: Ticket[]) {
  return tickets.reduce(
    (summary, ticket) => {
      if (ticket.status === "open") summary.open++;
      if (ticket.status === "in_progress") summary.in_progress++;
      if (ticket.status === "resolved") summary.resolved++;
      if (ticket.status === "closed") summary.closed++;
      if (ticket.priority === "urgent") summary.urgent++;
      return summary;
    },
    { open: 0, in_progress: 0, resolved: 0, closed: 0, urgent: 0 }
  );
}

export function updateTicketStatus(

  database: Database,
  ticketId: string,
  newStatus: TicketStatus,
  authorId?: string,
  comment?: string
  ): Ticket {
  const ticket = database.tickets.find(item => item.id === ticketId);
  if (!ticket) throw new Error("NOT_FOUND");

  const allowedStatuses: TicketStatus[] = ["open", "in_progress", "resolved", "closed"];
  if (!allowedStatuses.includes(newStatus)) throw new Error("INVALID_STATUS");

  if (newStatus === "closed" && !comment) throw new Error("COMMENT_REQUIRED");

  ticket.status = newStatus;
  ticket.updatedAt = new Date().toISOString();

  if (comment) {
  database.comments.push({
    id: generateId("comment"),
    ticketId: ticket.id,
    authorId: authorId || ticket.requesterId,
    message: comment,
    createdAt: new Date().toISOString(),
  });
  }

  writeDatabase(database);
  return ticket;
}