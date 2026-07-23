import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "./app";
import * as repository from "./infrastructure/database/prisma.repository";
import { prisma } from "./infrastructure/database/prisma";

vi.mock("./infrastructure/database/prisma.repository", () => ({
  getUsers: vi.fn(),
  getTickets: vi.fn(),
  getComments: vi.fn(),
  saveTicket: vi.fn(),
  updateTicket: vi.fn(),
  saveComment: vi.fn(),
}));

vi.mock("./infrastructure/database/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

describe("API Routes Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/health", () => {
    it("should return 200 ok status", async () => {
      const response = await request(app).get("/api/health");
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: "ok", service: "oxetech-helpdesk" });
    });
  });

  describe("GET /api/nonexistent-route (404 handler)", () => {
    it("should return 404 error", async () => {
      const response = await request(app).get("/api/nonexistent-route");
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Rota nao encontrada");
    });
  });

  describe("Error Middleware - 500 Generic Error", () => {
    it("should return 500 internal server error", async () => {
      vi.mocked(repository.getUsers).mockRejectedValueOnce(new Error("Db connection lost"));

      const response = await request(app).get("/api/users");
      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Erro interno do servidor");
    });
  });

  describe("GET /api/users", () => {
    it("should return list of users without passwords", async () => {
      const mockUsers = [
        { id: "1", name: "Ana", email: "a@e.com", role: "student", password: "pwd" },
      ];
      vi.mocked(repository.getUsers).mockResolvedValue(mockUsers as any);

      const response = await request(app).get("/api/users");
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].password).toBeUndefined();
      expect(response.body[0].name).toBe("Ana");
    });
  });

  describe("GET /api/tickets", () => {
    it("should return list of tickets and apply filters", async () => {
      const mockTickets = [
        { id: "1", title: "Login", description: "D", category: "sistemas", status: "open", requesterId: "u1" },
        { id: "2", title: "Projector", description: "D", category: "infra", status: "resolved", requesterId: "u2" },
      ];
      vi.mocked(repository.getTickets).mockResolvedValue(mockTickets as any);
      vi.mocked(repository.getUsers).mockResolvedValue([] as any);
      vi.mocked(repository.getComments).mockResolvedValue([] as any);

      const response = await request(app).get("/api/tickets?status=open&category=sistemas&search=Login");
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe("1");
    });
  });

  describe("GET /api/tickets/summary", () => {
    it("should return the tickets status summary", async () => {
      const mockTickets = [
        { id: "1", title: "T", description: "D", category: "sistemas", status: "open", priority: "urgent", requesterId: "u1" },
      ];
      vi.mocked(repository.getTickets).mockResolvedValue(mockTickets as any);

      const response = await request(app).get("/api/tickets/summary");
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        open: 1,
        in_progress: 0,
        resolved: 0,
        closed: 0,
        urgent: 1,
      });
    });
  });

  describe("GET /api/tickets/:id", () => {
    it("should return ticket details if found", async () => {
      const mockTicket = { id: "1", title: "T", description: "D", category: "sistemas", status: "open", requesterId: "u1" };
      vi.mocked(repository.getTickets).mockResolvedValue([mockTicket] as any);
      vi.mocked(repository.getUsers).mockResolvedValue([] as any);
      vi.mocked(repository.getComments).mockResolvedValue([] as any);

      const response = await request(app).get("/api/tickets/1");
      expect(response.status).toBe(200);
      expect(response.body.id).toBe("1");
    });

    it("should return 404 if ticket is not found", async () => {
      vi.mocked(repository.getTickets).mockResolvedValue([] as any);

      const response = await request(app).get("/api/tickets/nonexistent");
      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Ticket nao encontrado");
    });
  });

  describe("POST /api/tickets", () => {
    it("should create a ticket and return 201", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "user_ana" } as any);

      const response = await request(app)
        .post("/api/tickets")
        .send({
          title: "Problema no portal",
          description: "Nao consigo acessar",
          category: "sistemas",
          requesterId: "user_ana",
        });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe("Problema no portal");
      expect(response.body.status).toBe("open");
    });

    it("should return 400 if categories are invalid", async () => {
      const response = await request(app)
        .post("/api/tickets")
        .send({
          title: "Title",
          description: "Desc",
          category: "invalid_cat",
          requesterId: "user_ana",
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("Categoria invalida");
    });
  });

  describe("PATCH /api/tickets/:id/status", () => {
    it("should update status successfully", async () => {
      const mockTicket = { id: "1", title: "T", description: "D", category: "sistemas", status: "open", requesterId: "u1" };
      vi.mocked(repository.getTickets).mockResolvedValue([mockTicket] as any);

      const response = await request(app)
        .patch("/api/tickets/1/status")
        .send({ status: "in_progress" });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("in_progress");
    });

    it("should return 400 if closing without a comment", async () => {
      const mockTicket = { id: "1", title: "T", description: "D", category: "sistemas", status: "open", requesterId: "u1" };
      vi.mocked(repository.getTickets).mockResolvedValue([mockTicket] as any);

      const response = await request(app)
        .patch("/api/tickets/1/status")
        .send({ status: "closed" });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("comentario");
    });
  });

  describe("POST /api/tickets/:id/comments", () => {
    it("should add a comment successfully", async () => {
      const mockTicket = { id: "1", title: "T", description: "D", category: "sistemas", status: "open", requesterId: "u1" };
      vi.mocked(repository.getTickets).mockResolvedValue([mockTicket] as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "user_ana" } as any);

      const response = await request(app)
        .post("/api/tickets/1/comments")
        .send({ authorId: "user_ana", message: "Hello" });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Hello");
    });
  });
});
