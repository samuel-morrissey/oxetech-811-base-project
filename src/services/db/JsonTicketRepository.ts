import { Ticket } from "../../core/Ticket";
import { TicketRepository } from "../../core/repositories/TicketRepository";
import { DatabaseManager } from "./DatabaseManager";

export class JsonTicketRepository implements TicketRepository {
  findAll(): Ticket[] {
    return DatabaseManager.getInstance().getDatabase().tickets;
  }

  findById(id: string): Ticket | undefined {
    return this.findAll().find((ticket) => ticket.id === id);
  }

  add(ticket: Ticket): void {
    const manager = DatabaseManager.getInstance();
    const database = manager.getDatabase();
    database.tickets.push(ticket);
    manager.saveDatabase(database);
  }

  update(_ticket: Ticket): void {
    // Tickets are mutated in place on the in-memory database, so persisting
    // the whole database is enough to save the change.
    const manager = DatabaseManager.getInstance();
    manager.saveDatabase(manager.getDatabase());
  }
}
