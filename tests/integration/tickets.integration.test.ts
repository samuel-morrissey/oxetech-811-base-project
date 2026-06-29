import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import supertest from "supertest";
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const testDbPath = path.join(
  os.tmpdir(),
  `helpdesk-integration-${process.pid}.json`,
);

const seedDatabase = {
  users: [
    {
      id: "user_ana",
      name: "Ana Beatriz",
      email: "ana.aluna@example.com",
      role: "student",
      password: "123456",
    },
  ],
  tickets: [
    {
      id: "ticket_001",
      title: "Erro de login",
      description: "Usuario nao consegue entrar",
      category: "sistemas",
      status: "open",
      priority: "high",
      requesterId: "user_ana",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
  ],
  comments: [],
};

describe("Tickets API integration", () => {
  let request: ReturnType<typeof supertest>;

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    process.env.DATA_FILE = testDbPath;
    fs.writeFileSync(
      testDbPath,
      JSON.stringify(seedDatabase, null, 2),
    );

    vi.resetModules();

    const { createApp } = await import("../../src/app.js");
    request = supertest(createApp());
  });

  afterAll(() => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  it("POST /api/tickets cria chamado com status 201", async () => {
    const response = await request
      .post("/api/tickets")
      .send({
        title: "Novo chamado",
        description: "Descricao do chamado de integracao",
        category: "sistemas",
        requesterId: "user_ana",
      })
      .expect(201);

    expect(response.body.status).toBe("open");
    expect(response.body.title).toBe("Novo chamado");
  });

  it("POST /api/tickets com body invalido retorna 400", async () => {
    const response = await request
      .post("/api/tickets")
      .send({
        description: "Sem titulo",
        category: "sistemas",
        requesterId: "user_ana",
      })
      .expect(400);

    expect(response.body.message).toBe("Dados invalidos");
    expect(response.body.details?.issues).toBeDefined();
  });

  it("GET /api/tickets/:id inexistente retorna 404", async () => {
    const response = await request
      .get("/api/tickets/ticket_999")
      .expect(404);

    expect(response.body.message).toBe("Ticket nao encontrado");
    expect(response.body.details?.id).toBe("ticket_999");
  });

  it("GET /api/users nao expoe password", async () => {
    const response = await request.get("/api/users").expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0]).not.toHaveProperty("password");
  });
});
