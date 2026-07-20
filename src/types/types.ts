import { Ticket } from "../core/Ticket";


export type UserRole = "student" | "teacher" | "support";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  authorId: string;
  message: string;
  createdAt: string;
}

export interface Database {
  users: User[];
  tickets: Ticket[];
  comments: TicketComment[];
}