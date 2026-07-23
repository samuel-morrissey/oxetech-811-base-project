import fs from "node:fs";
import path from "node:path";
import type { Database, Ticket, TicketComment, User } from "../../domain/types";

const dataFile = process.env.DATA_FILE || "data/db.json";
const databasePath = path.resolve(process.cwd(), dataFile);

function readDatabase(): Database {
  const content = fs.readFileSync(databasePath, "utf-8");
  return JSON.parse(content) as Database;
}

function writeDatabase(database: Database) {
  fs.writeFileSync(databasePath, JSON.stringify(database, null, 2));
}

export function getUsers(): User[] {
  return readDatabase().users;
}

export function getTickets(): Ticket[] {
  return readDatabase().tickets;
}

export function getComments(): TicketComment[] {
  return readDatabase().comments;
}

export function saveTicket(ticket: Ticket) {
  const db = readDatabase();
  db.tickets.push(ticket);
  writeDatabase(db);
}

export function updateTicket(updatedTicket: Ticket) {
  const db = readDatabase();
  const index = db.tickets.findIndex((t) => t.id === updatedTicket.id);
  if (index !== -1) {
    db.tickets[index] = updatedTicket;
    writeDatabase(db);
  }
}

export function saveComment(comment: TicketComment) {
  const db = readDatabase();
  db.comments.push(comment);
  writeDatabase(db);
}
