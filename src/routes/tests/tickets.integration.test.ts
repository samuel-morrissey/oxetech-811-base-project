import { describe, test, expect, beforeEach } from "@jest/globals";
import request from "supertest";
import { createApp } from "../../app";
import { Ticket } from "../../core/Ticket";
import type { CommentRepository } from "../../core/repositories/CommentRepository";
import type { TicketRepository } from "../../core/repositories/TicketRepository";
import type { UserRepository } from "../../core/repositories/UserRepository";
import type { Mailer } from "../../services/email/EmailService";
import { hashPassword } from "../../services/security/password";
import type { TicketComment, User } from "../../types/types";

// Repositorios em memoria: os testes de integracao nao precisam de banco real.
// Injetamos implementacoes fake pela mesma interface usada em producao (Prisma).
class InMemoryUserRepository implements UserRepository {
  constructor(private readonly users: User[]) {}
  async findAll(): Promise<User[]> {
    return this.users;
  }
  async findById(id: string): Promise<User | undefined> {
    return this.users.find((user) => user.id === id);
  }
  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find((user) => user.email === email);
  }
}

class InMemoryTicketRepository implements TicketRepository {
  private readonly tickets: Ticket[] = [];
  async findAll(): Promise<Ticket[]> {
    return this.tickets;
  }
  async findById(id: string): Promise<Ticket | undefined> {
    return this.tickets.find((ticket) => ticket.id === id);
  }
  async add(ticket: Ticket): Promise<void> {
    this.tickets.push(ticket);
  }
  async update(): Promise<void> {
    // Tickets sao mutados em memoria; nao ha nada a persistir.
  }
}

class InMemoryCommentRepository implements CommentRepository {
  private readonly comments: TicketComment[] = [];
  async findByTicketId(ticketId: string): Promise<TicketComment[]> {
    return this.comments.filter((comment) => comment.ticketId === ticketId);
  }
  async findById(id: string): Promise<TicketComment | undefined> {
    return this.comments.find((comment) => comment.id === id);
  }
  async add(comment: TicketComment): Promise<void> {
    this.comments.push(comment);
  }
  async update(comment: TicketComment): Promise<void> {
    const index = this.comments.findIndex((current) => current.id === comment.id);
    if (index >= 0) {
      this.comments[index] = comment;
    }
  }
}

const noopMailer: Mailer = {
  async sendEmail(): Promise<void> {
    // Nao envia nada nos testes.
  },
};

function buildApp() {
  const users: User[] = [
    {
      id: "user_ana",
      name: "Ana Beatriz",
      email: "ana.aluna@example.com",
      role: "student",
      password: hashPassword("123456"),
    },
  ];

  return createApp({
    userRepository: new InMemoryUserRepository(users),
    ticketRepository: new InMemoryTicketRepository(),
    commentRepository: new InMemoryCommentRepository(),
    emailService: noopMailer,
  });
}

// Faz login e devolve um agente do supertest que guarda o cookie de sessao,
// da mesma forma que o Postman/Bruno fariam automaticamente entre requisicoes.
async function login(app: ReturnType<typeof buildApp>) {
  const agent = request.agent(app);
  const response = await agent
    .post("/api/auth/login")
    .send({ email: "ana.aluna@example.com", password: "123456" });
  expect(response.status).toBe(200);
  return agent;
}

describe("POST /api/tickets", () => {
  let app: ReturnType<typeof buildApp>;

  beforeEach(() => {
    app = buildApp();
  });

  test("cria um ticket com sucesso e retorna 201 (autoria vem da sessao)", async () => {
    const agent = await login(app);

    const response = await agent.post("/api/tickets").send({
      title: "Nao consigo acessar o portal",
      description: "Aparece erro ao tentar logar.",
      category: "sistemas",
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      title: "Nao consigo acessar o portal",
      category: "sistemas",
      // O solicitante nao vem do body: e o usuario autenticado.
      requesterId: "user_ana",
      status: "open",
    });
    // O ticket criado deve ter um id e uma prioridade calculada.
    expect(response.body.id).toBeDefined();
    expect(response.body.priority).toBeDefined();
  });

  test("retorna 400 quando faltam campos obrigatorios", async () => {
    const agent = await login(app);

    const response = await agent.post("/api/tickets").send({
      title: "So o titulo foi enviado",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Campos obrigatorios ausentes");
  });

  test("retorna 401 quando nao ha sessao (sem cookie)", async () => {
    const response = await request(app).post("/api/tickets").send({
      title: "Ticket sem estar logado",
      description: "Nao deveria ser criado.",
      category: "sistemas",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Nao autenticado");
  });
});
