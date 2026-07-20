import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  Database,
  Ticket,
  TicketComment,
  User,
} from "../../types";
import type { TicketRepository } from "../../repositories/ticketRepository";
import { generateId } from "../../utils/generateId";
import { createTicketService, type TicketService } from "../ticketService";
import { makeComment, makeDatabase, makeTicket, makeUser } from "./fixtures";

vi.mock("../../utils/generateId", () => ({
  generateId: vi.fn(),
}));

const mockedGenerateId = vi.mocked(generateId);
const FIXED_NOW = new Date("2026-01-01T12:00:00.000Z");

function makeFakeRepo(database: Database): TicketRepository {
  return {
    load: vi.fn(() => database),
    save: vi.fn(),
    findAllTickets: vi.fn((db) => db.tickets),
    findTicketById: vi.fn((db, id) =>
      db.tickets.find((ticket) => ticket.id === id),
    ),
    findUserById: vi.fn((db, id) => db.users.find((user) => user.id === id)),
    findCommentsByTicketId: vi.fn((db, ticketId) =>
      db.comments.filter((comment) => comment.ticketId === ticketId),
    ),
    addTicket: vi.fn((db, ticket) => {
      db.tickets.push(ticket);
    }),
    addComment: vi.fn((db, comment) => {
      db.comments.push(comment);
    }),
    touchTicket: vi.fn((ticket) => {
      ticket.updatedAt = new Date().toISOString();
    }),
    buildUserMap: vi.fn(
      (db) => new Map(db.users.map((user) => [user.id, user])),
    ),
    buildCommentCountByTicket: vi.fn((db) => {
      const counts = new Map<string, number>();
      for (const comment of db.comments) {
        counts.set(comment.ticketId, (counts.get(comment.ticketId) ?? 0) + 1);
      }
      return counts;
    }),
  };
}

function setup(database: Database): {
  service: TicketService;
  repo: TicketRepository;
} {
  const repo = makeFakeRepo(database);
  const service = createTicketService(repo);
  return { service, repo };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_NOW);
  mockedGenerateId.mockImplementation((prefix: string) => `${prefix}_generated`);
});

describe("listTickets", () => {
  const ana = makeUser({ id: "user_ana", name: "Ana" });
  const bob = makeUser({ id: "user_bob", name: "Bob", role: "support" });

  const t1 = makeTicket({
    id: "t1",
    title: "Login quebrado",
    description: "nao carrega",
    category: "sistemas",
    status: "open",
    requesterId: "user_ana",
    assignedToId: "user_bob",
  });
  const t2 = makeTicket({
    id: "t2",
    title: "Wifi caiu",
    description: "sem internet no lab",
    category: "infra",
    status: "in_progress",
    requesterId: "user_ana",
  });
  const t3 = makeTicket({
    id: "t3",
    title: "Duvida academica",
    description: "prova remarcada",
    category: "academico",
    status: "open",
    requesterId: "user_bob",
  });

  const c1 = makeComment({ id: "c1", ticketId: "t1" });
  const c2 = makeComment({ id: "c2", ticketId: "t1" });
  const c3 = makeComment({ id: "c3", ticketId: "t2" });

  function db(): Database {
    return makeDatabase({
      users: [ana, bob],
      tickets: [t1, t2, t3],
      comments: [c1, c2, c3],
    });
  }

  it("retorna todos os tickets quando filters esta vazio", () => {
    const { service } = setup(db());
    expect(service.listTickets({}).map((t) => t.id)).toEqual(["t1", "t2", "t3"]);
  });

  it("filtra por status", () => {
    const { service } = setup(db());
    expect(service.listTickets({ status: "open" }).map((t) => t.id)).toEqual([
      "t1",
      "t3",
    ]);
  });

  it("filtra por category", () => {
    const { service } = setup(db());
    expect(service.listTickets({ category: "infra" }).map((t) => t.id)).toEqual(
      ["t2"],
    );
  });

  it("filtra por search em title, description e category (case-insensitive)", () => {
    const { service } = setup(db());
    expect(service.listTickets({ search: "LOGIN" }).map((t) => t.id)).toEqual([
      "t1",
    ]);
    expect(service.listTickets({ search: "internet" }).map((t) => t.id)).toEqual(
      ["t2"],
    );
    expect(
      service.listTickets({ search: "academico" }).map((t) => t.id),
    ).toEqual(["t3"]);
  });

  it("combina multiplos filtros", () => {
    const { service } = setup(db());
    expect(
      service.listTickets({ status: "open", search: "duvida" }).map((t) => t.id),
    ).toEqual(["t3"]);
  });

  it("preenche requester, assigned e commentsCount", () => {
    const { service } = setup(db());
    const result = service.listTickets({});
    const first = result.find((t) => t.id === "t1")!;
    expect(first.requester?.id).toBe("user_ana");
    expect(first.assigned?.id).toBe("user_bob");
    expect(first.commentsCount).toBe(2);

    const second = result.find((t) => t.id === "t2")!;
    expect(second.assigned).toBeUndefined();
    expect(second.commentsCount).toBe(1);

    const third = result.find((t) => t.id === "t3")!;
    expect(third.commentsCount).toBe(0);
  });
});

describe("getTicketById", () => {
  it("retorna null quando o ticket nao existe", () => {
    const { service } = setup(makeDatabase());
    expect(service.getTicketById("missing")).toBeNull();
  });

  it("retorna TicketDetail com requester, assigned e comments com autor", () => {
    const ana = makeUser({ id: "user_ana" });
    const bob = makeUser({ id: "user_bob", role: "support" });
    const ticket = makeTicket({
      id: "t1",
      requesterId: "user_ana",
      assignedToId: "user_bob",
    });
    const comment = makeComment({ id: "c1", ticketId: "t1", authorId: "user_bob" });
    const { service } = setup(
      makeDatabase({ users: [ana, bob], tickets: [ticket], comments: [comment] }),
    );

    const result = service.getTicketById("t1");

    expect(result).not.toBeNull();
    expect(result!.requester?.id).toBe("user_ana");
    expect(result!.assigned?.id).toBe("user_bob");
    expect(result!.comments).toHaveLength(1);
    expect(result!.comments[0].author?.id).toBe("user_bob");
  });
});

describe("createTicket", () => {
  it("retorna invalid_requester quando o solicitante nao existe", () => {
    const { service, repo } = setup(makeDatabase({ users: [] }));

    const result = service.createTicket({
      title: "x",
      description: "y",
      category: "sistemas",
      requesterId: "user_missing",
    });

    expect(result).toEqual({
      success: false,
      error: { code: "invalid_requester" },
    });
    expect(repo.addTicket).not.toHaveBeenCalled();
    expect(repo.save).not.toHaveBeenCalled();
  });

  it("persiste o ticket e retorna sucesso quando o solicitante existe", () => {
    const ana = makeUser({ id: "user_ana" });
    const database = makeDatabase({ users: [ana] });
    const { service, repo } = setup(database);

    const result = service.createTicket({
      title: "Nao consigo enviar atividade",
      description: "erro ao anexar",
      category: "sistemas",
      requesterId: "user_ana",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.ticket).toMatchObject({
      id: "ticket_generated",
      title: "Nao consigo enviar atividade",
      status: "open",
      requesterId: "user_ana",
      createdAt: FIXED_NOW.toISOString(),
      updatedAt: FIXED_NOW.toISOString(),
    });
    expect(repo.addTicket).toHaveBeenCalledWith(database, result.ticket);
    expect(repo.save).toHaveBeenCalledWith(database);
  });

  it("calcula priority=urgent para categoria infra", () => {
    const { service } = setup(makeDatabase({ users: [makeUser()] }));
    const result = service.createTicket({
      title: "t",
      description: "desc curta",
      category: "infra",
      requesterId: "user_ana",
    });
    expect(result.success && result.ticket.priority).toBe("urgent");
  });

  it("calcula priority=urgent quando a descricao contem a palavra 'urgente'", () => {
    const { service } = setup(makeDatabase({ users: [makeUser()] }));
    const result = service.createTicket({
      title: "t",
      description: "Isso e URGENTE, por favor",
      category: "academico",
      requesterId: "user_ana",
    });
    expect(result.success && result.ticket.priority).toBe("urgent");
  });

  it("calcula priority=high para categoria sistemas", () => {
    const { service } = setup(makeDatabase({ users: [makeUser()] }));
    const result = service.createTicket({
      title: "t",
      description: "curta",
      category: "sistemas",
      requesterId: "user_ana",
    });
    expect(result.success && result.ticket.priority).toBe("high");
  });

  it("calcula priority=high quando a descricao ultrapassa o threshold", () => {
    const { service } = setup(makeDatabase({ users: [makeUser()] }));
    const result = service.createTicket({
      title: "t",
      description: "a".repeat(221),
      category: "academico",
      requesterId: "user_ana",
    });
    expect(result.success && result.ticket.priority).toBe("high");
  });

  it("calcula priority=medium para categoria academico", () => {
    const { service } = setup(makeDatabase({ users: [makeUser()] }));
    const result = service.createTicket({
      title: "t",
      description: "curta",
      category: "academico",
      requesterId: "user_ana",
    });
    expect(result.success && result.ticket.priority).toBe("medium");
  });

  it("calcula priority=low para categoria desconhecida sem gatilhos", () => {
    const { service } = setup(makeDatabase({ users: [makeUser()] }));
    const result = service.createTicket({
      title: "t",
      description: "curta",
      category: "outro",
      requesterId: "user_ana",
    });
    expect(result.success && result.ticket.priority).toBe("low");
  });
});

describe("updateTicketStatus", () => {
  it("retorna not_found quando o ticket nao existe", () => {
    const { service, repo } = setup(makeDatabase());
    const result = service.updateTicketStatus("missing", { status: "in_progress" });
    expect(result).toEqual({ success: false, error: { code: "not_found" } });
    expect(repo.save).not.toHaveBeenCalled();
  });

  it("retorna comment_required_to_close ao fechar sem comment", () => {
    const ticket = makeTicket({ id: "t1", status: "in_progress" });
    const { service, repo } = setup(makeDatabase({ tickets: [ticket] }));

    const result = service.updateTicketStatus("t1", { status: "closed" });

    expect(result).toEqual({
      success: false,
      error: { code: "comment_required_to_close" },
    });
    expect(ticket.status).toBe("in_progress");
    expect(repo.save).not.toHaveBeenCalled();
  });

  it("atualiza status, chama touchTicket e persiste quando valido", () => {
    const ticket = makeTicket({ id: "t1", status: "open" });
    const database = makeDatabase({ tickets: [ticket] });
    const { service, repo } = setup(database);

    const result = service.updateTicketStatus("t1", { status: "in_progress" });

    expect(result.success).toBe(true);
    expect(ticket.status).toBe("in_progress");
    expect(repo.touchTicket).toHaveBeenCalledWith(ticket);
    expect(repo.save).toHaveBeenCalledWith(database);
    expect(repo.addComment).not.toHaveBeenCalled();
  });

  it("adiciona comentario quando informado, usando authorId do input", () => {
    const ticket = makeTicket({ id: "t1", requesterId: "user_ana" });
    const database = makeDatabase({ tickets: [ticket] });
    const { service, repo } = setup(database);

    const result = service.updateTicketStatus("t1", {
      status: "closed",
      comment: "Resolvido.",
      authorId: "user_carla",
    });

    expect(result.success).toBe(true);
    expect(repo.addComment).toHaveBeenCalledTimes(1);
    const [, addedComment] = (repo.addComment as unknown as {
      mock: { calls: [Database, TicketComment][] };
    }).mock.calls[0];
    expect(addedComment).toMatchObject({
      id: "comment_generated",
      ticketId: "t1",
      authorId: "user_carla",
      message: "Resolvido.",
      createdAt: FIXED_NOW.toISOString(),
    });
  });

  it("faz fallback do authorId para o requesterId quando ausente", () => {
    const ticket = makeTicket({ id: "t1", requesterId: "user_ana" });
    const { service, repo } = setup(makeDatabase({ tickets: [ticket] }));

    service.updateTicketStatus("t1", {
      status: "in_progress",
      comment: "Em analise.",
    });

    const [, addedComment] = (repo.addComment as unknown as {
      mock: { calls: [Database, TicketComment][] };
    }).mock.calls[0];
    expect(addedComment.authorId).toBe("user_ana");
  });
});

describe("addTicketComment", () => {
  it("retorna not_found quando o ticket nao existe", () => {
    const { service, repo } = setup(makeDatabase());
    const result = service.addTicketComment("missing", {
      message: "oi",
      authorId: "user_ana",
    });
    expect(result).toEqual({ success: false, error: { code: "not_found" } });
    expect(repo.addComment).not.toHaveBeenCalled();
    expect(repo.save).not.toHaveBeenCalled();
  });

  it("cria comentario, chama touchTicket e persiste", () => {
    const ticket: Ticket = makeTicket({ id: "t1" });
    const database = makeDatabase({ tickets: [ticket] });
    const { service, repo } = setup(database);

    const result = service.addTicketComment("t1", {
      message: "Solicitei mais informacoes.",
      authorId: "user_carla",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.comment).toMatchObject({
      id: "comment_generated",
      ticketId: "t1",
      authorId: "user_carla",
      message: "Solicitei mais informacoes.",
      createdAt: FIXED_NOW.toISOString(),
    });
    expect(repo.addComment).toHaveBeenCalledWith(database, result.comment);
    expect(repo.touchTicket).toHaveBeenCalledWith(ticket);
    expect(repo.save).toHaveBeenCalledWith(database);
  });
});
