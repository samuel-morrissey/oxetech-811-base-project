import { describe, it, expect, vi, beforeEach } from "vitest";
import * as service from "./ticket.service";
import * as repository from "../../infrastructure/database/prisma.repository";
import { prisma } from "../../infrastructure/database/prisma";
import { ValidationError, NotFoundError } from "../errors/app-error";

vi.mock("../../infrastructure/database/prisma.repository", () => ({
  saveTicket: vi.fn(),
  updateTicket: vi.fn(),
  saveComment: vi.fn(),
  getTickets: vi.fn(),
}));

vi.mock("../../infrastructure/database/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

describe("ticket.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createTicket", () => {
    it("should create a ticket successfully when payload is valid", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "user_ana" } as any);

      const ticket = await service.createTicket({
        title: "Problema no login",
        description: "Mensagem de erro generica",
        category: "sistemas",
        requesterId: "user_ana",
      });

      expect(ticket.id).toBeDefined();
      expect(ticket.status).toBe("open");
      expect(ticket.priority).toBe("high");
      expect(repository.saveTicket).toHaveBeenCalledWith(ticket);
    });

    it("should throw ValidationError if category is invalid", async () => {
      await expect(
        service.createTicket({
          title: "Title",
          description: "Desc",
          category: "invalid_category",
          requesterId: "user_ana",
        }),
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError if requester does not exist", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(
        service.createTicket({
          title: "Title",
          description: "Desc",
          category: "sistemas",
          requesterId: "nonexistent",
        }),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("updateTicketStatus", () => {
    it("should update status successfully", async () => {
      const mockTicket = {
        id: "ticket_001",
        title: "T",
        description: "D",
        category: "sistemas",
        status: "open",
        priority: "high",
        requesterId: "user_ana",
        createdAt: "",
        updatedAt: "",
      };

      vi.mocked(repository.getTickets).mockResolvedValue([mockTicket] as any);

      const updated = await service.updateTicketStatus("ticket_001", "in_progress");

      expect(updated.status).toBe("in_progress");
      expect(repository.updateTicket).toHaveBeenCalledWith(updated);
    });

    it("should throw NotFoundError if ticket does not exist", async () => {
      vi.mocked(repository.getTickets).mockResolvedValue([]);

      await expect(
        service.updateTicketStatus("nonexistent", "in_progress"),
      ).rejects.toThrow(NotFoundError);
    });
  });
});
