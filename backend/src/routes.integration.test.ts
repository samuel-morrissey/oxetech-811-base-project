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
});
