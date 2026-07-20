import { beforeEach, describe, expect, it, vi } from "vitest";

import { generateId } from "../../utils/generateId";
import { makeComment, makeTicket } from "../ticketFactory";

vi.mock("../../utils/generateId", () => ({
  generateId: vi.fn(),
}));

const mockedGenerateId = vi.mocked(generateId);

beforeEach(() => {
  vi.clearAllMocks();
  mockedGenerateId.mockImplementation((prefix: string) => `${prefix}_generated`);
});

describe("makeTicket", () => {
  it("cria ticket com defaults e priority resolvida", () => {
    const now = "2026-01-01T00:00:00.000Z";
    const ticket = makeTicket(
      {
        title: "Titulo",
        description: "descricao curta",
        category: "sistemas",
        requesterId: "user_ana",
        assignedToId: "user_bob",
      },
      now,
    );

    expect(ticket).toEqual({
      id: "ticket_generated",
      title: "Titulo",
      description: "descricao curta",
      category: "sistemas",
      requesterId: "user_ana",
      assignedToId: "user_bob",
      status: "open",
      priority: "high",
      createdAt: now,
      updatedAt: now,
    });
    expect(mockedGenerateId).toHaveBeenCalledWith("ticket");
  });

  it("delega o calculo de priority para resolvePriority (categoria infra → urgent)", () => {
    const ticket = makeTicket(
      {
        title: "t",
        description: "curta",
        category: "infra",
        requesterId: "user_ana",
      },
      "2026-01-01T00:00:00.000Z",
    );
    expect(ticket.priority).toBe("urgent");
  });
});

describe("makeComment", () => {
  it("cria comment com id gerado e createdAt propagado", () => {
    const now = "2026-06-15T10:30:00.000Z";
    const comment = makeComment(
      { ticketId: "t1", authorId: "user_ana", message: "oi" },
      now,
    );

    expect(comment).toEqual({
      id: "comment_generated",
      ticketId: "t1",
      authorId: "user_ana",
      message: "oi",
      createdAt: now,
    });
    expect(mockedGenerateId).toHaveBeenCalledWith("comment");
  });
});
