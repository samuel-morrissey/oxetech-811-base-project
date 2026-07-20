import { Ticket } from "../Ticket";

export interface TicketRepository {
  findAll(): Promise<Ticket[]>;
  findById(id: string): Promise<Ticket | undefined>;
  add(ticket: Ticket): Promise<void>;
  update(ticket: Ticket): Promise<void>;
}
