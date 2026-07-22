import type { Database, Ticket, TicketComment, User } from "../../types";

export function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: "user_ana",
    name: "Ana",
    email: "ana@example.com",
    role: "student",
    password: "hash",
    ...overrides,
  };
}

export function makeTicket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: "ticket_001",
    title: "Nao consigo logar",
    description: "Erro ao acessar o portal",
    category: "sistemas",
    status: "open",
    priority: "high",
    requesterId: "user_ana",
    assignedToId: undefined,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

export function makeComment(overrides: Partial<TicketComment> = {}): TicketComment {
  return {
    id: "comment_001",
    ticketId: "ticket_001",
    authorId: "user_ana",
    message: "Alguma novidade?",
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

export function makeDatabase(overrides: Partial<Database> = {}): Database {
  return {
    users: overrides.users ?? [],
    tickets: overrides.tickets ?? [],
    comments: overrides.comments ?? [],
  };
}
