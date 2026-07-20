import fs from "node:fs";
import path from "node:path";
import { generateId} from "../utils/utils";
import type { Database, Ticket, TicketStatus } from "../types";

const dataFile = process.env.DATA_FILE || "data/db.json";
const databasePath = path.resolve(process.cwd(), dataFile);

function writeDatabase(database: Database) {
  fs.writeFileSync(databasePath, JSON.stringify(database, null, 2));
}

export function filterTickets(tickets: Ticket[], query: any): Ticket[] {
  let result = tickets;

  if (query.status) {
    result = result.filter(ticket => ticket.status === query.status);
  }

  if (query.category) {
    result = result.filter(ticket => ticket.category === query.category);
  }

  if (query.search) {
    const search = String(query.search).toLowerCase();
    result = result.filter(ticket =>
      ticket.title.toLowerCase().includes(search) ||
      ticket.description.toLowerCase().includes(search) ||
      ticket.category.toLowerCase().includes(search)
    );
  }

  return result;
}

export function enrichTickets(tickets: Ticket[], database: Database) {
  return tickets.map(ticket => {
    const requester = database.users.find(user => user.id === ticket.requesterId);
    const assigned = database.users.find(user => user.id === ticket.assignedToId);
    const comments = database.comments.filter(comment => comment.ticketId === ticket.id);

    return {
      ...ticket,
      requester,
      assigned,
      commentsCount: comments.length,
    };
  });
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