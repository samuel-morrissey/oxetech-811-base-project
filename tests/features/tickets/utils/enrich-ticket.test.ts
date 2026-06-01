import { describe, expect, it, vi } from "vitest";
import {
  enrichTicketForList,
  enrichTicketWithComments,
} from "../../../../src/features/tickets/utils/enrich-ticket.js";
import type { Ticket } from "../../../../src/features/tickets/types/ticket.js";
import type { TicketsRepository } from "../../../../src/features/tickets/tickets.repository.js";
import type { Repository } from "../../../../src/domain/repository.js";
import type { User } from "../../../../src/features/users/types/user.js";

const ticket: Ticket = {
  id: "ticket_1",
  title: "Erro de login",
  description: "Usuario nao consegue entrar",
  category: "sistemas",
  requesterId: "user_1",
  assignedToId: "user_2",
  status: "open",
  priority: "high",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const users: Record<string, User> = {
  user_1: {
    id: "user_1",
    name: "Ana",
    email: "ana@example.com",
    role: "student",
    password: "secret",
  },
  user_2: {
    id: "user_2",
    name: "Carla",
    email: "carla@example.com",
    role: "support",
    password: "secret",
  },
};

function createUsersRepository(): Repository<User> {
  return {
    findAll: vi.fn(),
    findById: vi.fn((id: string) => users[id]),
  };
}

function createTicketsRepository(): TicketsRepository {
  return {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    findCommentsByTicketId: vi.fn(() => [
      {
        id: "comment_1",
        ticketId: "ticket_1",
        authorId: "user_2",
        message: "Em analise",
        createdAt: "2026-01-01T01:00:00.000Z",
      },
    ]),
    createComment: vi.fn(),
  };
}

describe("enrichTicketForList", () => {
  it("enriquece ticket com requester, assigned e contagem de comentarios", () => {
    const ticketsRepository = createTicketsRepository();
    const usersRepository = createUsersRepository();

    expect(
      enrichTicketForList(ticketsRepository, usersRepository, ticket),
    ).toEqual({
      ...ticket,
      requester: users.user_1,
      assigned: users.user_2,
      commentsCount: 1,
    });
  });

  it("nao busca assigned quando ticket nao possui assignedToId", () => {
    const ticketsRepository = createTicketsRepository();
    const usersRepository = createUsersRepository();
    const ticketWithoutAssignee = {
      ...ticket,
      assignedToId: undefined,
    };

    expect(
      enrichTicketForList(
        ticketsRepository,
        usersRepository,
        ticketWithoutAssignee,
      ).assigned,
    ).toBeUndefined();
  });
});

describe("enrichTicketWithComments", () => {
  it("enriquece ticket com comentarios e autores", () => {
    const ticketsRepository = createTicketsRepository();
    const usersRepository = createUsersRepository();

    expect(
      enrichTicketWithComments(
        ticketsRepository,
        usersRepository,
        ticket,
      ),
    ).toEqual({
      ...ticket,
      requester: users.user_1,
      assigned: users.user_2,
      comments: [
        {
          id: "comment_1",
          ticketId: "ticket_1",
          authorId: "user_2",
          message: "Em analise",
          createdAt: "2026-01-01T01:00:00.000Z",
          author: users.user_2,
        },
      ],
    });
  });
});
