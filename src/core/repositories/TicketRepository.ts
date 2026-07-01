import { Ticket } from "../Ticket";

export interface TicketRepository {
  findAll(): Ticket[];
  findById(id: string): Ticket | undefined;
  add(ticket: Ticket): void;
  update(ticket: Ticket): void;
}
