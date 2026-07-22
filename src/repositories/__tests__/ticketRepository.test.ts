import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Database } from "../../types";
import * as db from "../database";
import {
  addComment,
  addTicket,
  buildCommentCountByTicket,
  buildUserMap,
  findAllTickets,
  findCommentsByTicketId,
  findTicketById,
  findUserById,
  loadDatabase,
  saveDatabase,
  touchTicket,
} from "../ticketRepository";
import {
  makeComment,
  makeDatabase,
  makeTicket,
  makeUser,
} from "../../services/__tests__/fixtures";

vi.mock("../database");
const mockedDb = vi.mocked(db);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("loadDatabase / saveDatabase", () => {
  it("loadDatabase delega para readDatabase", () => {
    const database = makeDatabase();
    mockedDb.readDatabase.mockReturnValue(database);
    expect(loadDatabase()).toBe(database);
    expect(mockedDb.readDatabase).toHaveBeenCalledTimes(1);
  });

  it("saveDatabase delega para writeDatabase", () => {
    const database = makeDatabase();
    saveDatabase(database);
    expect(mockedDb.writeDatabase).toHaveBeenCalledWith(database);
  });
});

describe("findAllTickets", () => {
  it("retorna a referencia do array de tickets do database", () => {
    const t1 = makeTicket({ id: "t1" });
    const t2 = makeTicket({ id: "t2" });
    const database = makeDatabase({ tickets: [t1, t2] });
    expect(findAllTickets(database)).toBe(database.tickets);
    expect(findAllTickets(database)).toEqual([t1, t2]);
  });
});

describe("findTicketById", () => {
  it("retorna o ticket quando encontrado", () => {
    const ticket = makeTicket({ id: "t1" });
    const database = makeDatabase({ tickets: [ticket] });
    expect(findTicketById(database, "t1")).toBe(ticket);
  });

  it("retorna undefined quando nao existe", () => {
    const database = makeDatabase({ tickets: [makeTicket({ id: "t1" })] });
    expect(findTicketById(database, "missing")).toBeUndefined();
  });
});

describe("findUserById", () => {
  it("retorna o usuario quando encontrado", () => {
    const user = makeUser({ id: "u1" });
    const database = makeDatabase({ users: [user] });
    expect(findUserById(database, "u1")).toBe(user);
  });

  it("retorna undefined quando nao existe", () => {
    const database = makeDatabase({ users: [makeUser({ id: "u1" })] });
    expect(findUserById(database, "u2")).toBeUndefined();
  });
});

describe("findCommentsByTicketId", () => {
  it("filtra apenas os comentarios do ticket informado", () => {
    const c1 = makeComment({ id: "c1", ticketId: "t1" });
    const c2 = makeComment({ id: "c2", ticketId: "t2" });
    const c3 = makeComment({ id: "c3", ticketId: "t1" });
    const database = makeDatabase({ comments: [c1, c2, c3] });

    expect(findCommentsByTicketId(database, "t1")).toEqual([c1, c3]);
    expect(findCommentsByTicketId(database, "t3")).toEqual([]);
  });
});

describe("addTicket / addComment", () => {
  it("addTicket faz push no array de tickets", () => {
    const database = makeDatabase();
    const ticket = makeTicket({ id: "t_new" });
    addTicket(database, ticket);
    expect(database.tickets).toEqual([ticket]);
  });

  it("addComment faz push no array de comments", () => {
    const database = makeDatabase();
    const comment = makeComment({ id: "c_new" });
    addComment(database, comment);
    expect(database.comments).toEqual([comment]);
  });
});

describe("touchTicket", () => {
  it("atualiza updatedAt com o timestamp atual", () => {
    vi.useFakeTimers();
    const now = new Date("2026-06-15T10:30:00.000Z");
    vi.setSystemTime(now);

    const ticket = makeTicket({ updatedAt: "2020-01-01T00:00:00.000Z" });
    touchTicket(ticket);

    expect(ticket.updatedAt).toBe(now.toISOString());
    vi.useRealTimers();
  });
});

describe("buildUserMap", () => {
  it("retorna um Map indexado por id", () => {
    const ana = makeUser({ id: "u_ana" });
    const bob = makeUser({ id: "u_bob" });
    const database = makeDatabase({ users: [ana, bob] });

    const map = buildUserMap(database);

    expect(map.size).toBe(2);
    expect(map.get("u_ana")).toBe(ana);
    expect(map.get("u_bob")).toBe(bob);
    expect(map.get("missing")).toBeUndefined();
  });

  it("retorna Map vazio quando nao ha usuarios", () => {
    expect(buildUserMap(makeDatabase()).size).toBe(0);
  });
});

describe("buildCommentCountByTicket", () => {
  it("conta comentarios agrupados por ticketId", () => {
    const database: Database = makeDatabase({
      comments: [
        makeComment({ id: "c1", ticketId: "t1" }),
        makeComment({ id: "c2", ticketId: "t1" }),
        makeComment({ id: "c3", ticketId: "t2" }),
      ],
    });

    const counts = buildCommentCountByTicket(database);

    expect(counts.get("t1")).toBe(2);
    expect(counts.get("t2")).toBe(1);
    expect(counts.get("t3")).toBeUndefined();
  });

  it("retorna Map vazio quando nao ha comentarios", () => {
    expect(buildCommentCountByTicket(makeDatabase()).size).toBe(0);
  });
});
