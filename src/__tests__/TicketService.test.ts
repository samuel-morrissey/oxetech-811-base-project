import { describe, it, expect, vi } from "vitest";
import { TicketService } from "../services/TicketService";
import type { User } from "../types";
import { AppError } from "../errors/AppError";

const mockUser: User = {
  id: "user_ana",
  name: "Ana Beatriz",
  email: "ana.aluna@example.com",
  role: "student",
  password: "123",
};

describe("TicketService", () => {
  it("lança erro ao criar ticket com solicitante inexistente", () => {
    const mockUserRepo = {
      findAll: vi.fn(),
      findById: vi.fn().mockReturnValue(undefined),
    };
    const mockTicketRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      createComment: vi.fn(),
      findCommentsByTicketId: vi.fn(),
      findAllComments: vi.fn(),
    };

    const service = new TicketService(mockTicketRepo, mockUserRepo);

    expect(() =>
      service.createTicket({
        title: "Test",
        description: "Test description",
        category: "infra",
        requesterId: "non_existent",
      })
    ).toThrowError(new AppError("Solicitante inválido", 400));
  });

  it("calcula prioridade 'urgent' para categoria infra ao criar ticket", () => {
    const mockUserRepo = {
      findAll: vi.fn(),
      findById: vi.fn().mockReturnValue(mockUser),
    };
    const mockTicketRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn((t) => t),
      update: vi.fn(),
      createComment: vi.fn(),
      findCommentsByTicketId: vi.fn(),
      findAllComments: vi.fn(),
    };

    const service = new TicketService(mockTicketRepo, mockUserRepo);
    const ticket = service.createTicket({
      title: "Test",
      description: "Test description",
      category: "infra",
      requesterId: "user_ana",
    });

    expect(ticket.priority).toBe("urgent");
    expect(mockTicketRepo.create).toHaveBeenCalled();
  });

  it("lança erro ao buscar ticket inexistente", () => {
    const mockUserRepo = {
      findAll: vi.fn(),
      findById: vi.fn(),
    };
    const mockTicketRepo = {
      findAll: vi.fn(),
      findById: vi.fn().mockReturnValue(undefined),
      create: vi.fn(),
      update: vi.fn(),
      createComment: vi.fn(),
      findCommentsByTicketId: vi.fn(),
      findAllComments: vi.fn(),
    };

    const service = new TicketService(mockTicketRepo, mockUserRepo);

    expect(() => service.getTicketDetail("non_existent")).toThrowError(
      new AppError("Ticket não encontrado", 404)
    );
  });
});
