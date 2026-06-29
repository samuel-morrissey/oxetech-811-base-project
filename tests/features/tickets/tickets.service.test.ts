import { describe, expect, it, vi } from "vitest";
import type { Repository } from "../../../src/domain/repository.js";
import { BadRequest, NotFound } from "../../../src/http/api-error.js";
import type { TicketsRepository } from "../../../src/features/tickets/tickets.repository.js";
import { TicketsService } from "../../../src/features/tickets/tickets.service.js";
import type { TicketComment } from "../../../src/features/tickets/types/ticket-comment.js";
import type { Ticket } from "../../../src/features/tickets/types/ticket.js";
import type { User } from "../../../src/features/users/types/user.js";

const sampleUser: User = {
  id: "user_ana",
  name: "Ana Beatriz",
  email: "ana.aluna@example.com",
  role: "student",
  password: "123456",
};

const sampleTicket: Ticket = {
  id: "ticket_001",
  title: "Erro de login",
  description: "Usuario nao consegue entrar",
  category: "sistemas",
  requesterId: "user_ana",
  status: "open",
  priority: "high",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const sampleComment: TicketComment = {
  id: "comment_001",
  ticketId: "ticket_001",
  authorId: "user_ana",
  message: "Comentario de teste",
  createdAt: "2026-01-01T00:00:00.000Z",
};

function createTicketsRepositoryMock(): TicketsRepository {
  return {
    findAll: vi.fn(() => [sampleTicket]),
    findById: vi.fn(),
    create: vi.fn((ticket: Ticket) => ticket),
    save: vi.fn((ticket: Ticket) => ticket),
    findCommentsByTicketId: vi.fn((): TicketComment[] => []),
    createComment: vi.fn((comment: TicketComment) => comment),
  };
}

function createUsersRepositoryMock(): Repository<User> {
  return {
    findAll: vi.fn(() => [sampleUser]),
    findById: vi.fn(),
  };
}

function createService(
  ticketsRepository = createTicketsRepositoryMock(),
  usersRepository = createUsersRepositoryMock(),
) {
  return new TicketsService(ticketsRepository, usersRepository);
}

describe("TicketsService", () => {
  it("create lanca BadRequest quando requester nao existe", () => {
    const usersRepository = createUsersRepositoryMock();
    vi.mocked(usersRepository.findById).mockReturnValue(undefined);

    const service = createService(undefined, usersRepository);

    expect(() =>
      service.create({
        title: "Titulo",
        description: "Descricao",
        category: "sistemas",
        requesterId: "user_inexistente",
      }),
    ).toThrow(BadRequest);
  });

  it("create retorna ticket open com prioridade calculada", () => {
    const ticketsRepository = createTicketsRepositoryMock();
    const usersRepository = createUsersRepositoryMock();
    vi.mocked(usersRepository.findById).mockReturnValue(sampleUser);

    const service = createService(ticketsRepository, usersRepository);

    const ticket = service.create({
      title: "Titulo",
      description: "Usuario nao consegue entrar",
      category: "sistemas",
      requesterId: "user_ana",
    });

    expect(ticket.status).toBe("open");
    expect(ticket.priority).toBe("high");
    expect(ticketsRepository.create).toHaveBeenCalledOnce();
  });

  it("findById lanca NotFound com details.id quando ticket nao existe", () => {
    const ticketsRepository = createTicketsRepositoryMock();
    vi.mocked(ticketsRepository.findById).mockReturnValue(undefined);

    const service = createService(ticketsRepository);

    try {
      service.findById("ticket_999");
      expect.fail("deveria lancar NotFound");
    } catch (error) {
      expect(error).toBeInstanceOf(NotFound);
      expect((error as NotFound).details).toEqual({
        id: "ticket_999",
      });
    }
  });

  it("updateStatus lanca NotFound quando ticket nao existe", () => {
    const ticketsRepository = createTicketsRepositoryMock();
    vi.mocked(ticketsRepository.findById).mockReturnValue(undefined);

    const service = createService(ticketsRepository);

    expect(() =>
      service.updateStatus({
        ticketId: "ticket_999",
        status: "in_progress",
      }),
    ).toThrow(NotFound);
  });

  it("updateStatus lanca BadRequest ao fechar sem comentario", () => {
    const ticketsRepository = createTicketsRepositoryMock();
    vi.mocked(ticketsRepository.findById).mockReturnValue({
      ...sampleTicket,
    });

    const service = createService(ticketsRepository);

    expect(() =>
      service.updateStatus({
        ticketId: "ticket_001",
        status: "closed",
      }),
    ).toThrow(BadRequest);
  });

  it("updateStatus atualiza ticket em transicao valida", () => {
    const ticketsRepository = createTicketsRepositoryMock();
    vi.mocked(ticketsRepository.findById).mockReturnValue({
      ...sampleTicket,
    });

    const service = createService(ticketsRepository);

    const updated = service.updateStatus({
      ticketId: "ticket_001",
      status: "in_progress",
    });

    expect(updated.status).toBe("in_progress");
    expect(ticketsRepository.save).toHaveBeenCalledOnce();
  });

  it("addComment lanca NotFound quando ticket nao existe", () => {
    const ticketsRepository = createTicketsRepositoryMock();
    vi.mocked(ticketsRepository.findById).mockReturnValue(undefined);

    const service = createService(ticketsRepository);

    expect(() =>
      service.addComment({
        ticketId: "ticket_999",
        message: "Mensagem",
        authorId: "user_ana",
      }),
    ).toThrow(NotFound);
  });

  it("addComment cria comentario quando dados sao validos", () => {
    const ticketsRepository = createTicketsRepositoryMock();
    vi.mocked(ticketsRepository.findById).mockReturnValue({
      ...sampleTicket,
    });
    vi.mocked(ticketsRepository.createComment).mockReturnValue(
      sampleComment,
    );

    const service = createService(ticketsRepository);

    const comment = service.addComment({
      ticketId: "ticket_001",
      message: "Comentario de teste",
      authorId: "user_ana",
    });

    expect(comment.message).toBe("Comentario de teste");
    expect(ticketsRepository.createComment).toHaveBeenCalledOnce();
  });
});
