import { describe, expect, it } from "vitest";
import { buildTicketSummary } from "../../../../src/features/tickets/utils/ticket-summary.js";
import type { Ticket } from "../../../../src/features/tickets/types/ticket.js";

describe("buildTicketSummary", () => {
  it("contabiliza status e tickets urgentes", () => {
    const tickets: Ticket[] = [
      {
        id: "ticket_1",
        title: "A",
        description: "A",
        category: "infra",
        requesterId: "user_1",
        status: "open",
        priority: "urgent",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "ticket_2",
        title: "B",
        description: "B",
        category: "sistemas",
        requesterId: "user_2",
        status: "in_progress",
        priority: "high",
        createdAt: "2026-01-02T00:00:00.000Z",
        updatedAt: "2026-01-02T00:00:00.000Z",
      },
      {
        id: "ticket_3",
        title: "C",
        description: "C",
        category: "academico",
        requesterId: "user_3",
        status: "closed",
        priority: "urgent",
        createdAt: "2026-01-03T00:00:00.000Z",
        updatedAt: "2026-01-03T00:00:00.000Z",
      },
    ];

    expect(buildTicketSummary(tickets)).toEqual({
      open: 1,
      in_progress: 1,
      resolved: 0,
      closed: 1,
      urgent: 2,
    });
  });

  it("retorna zeros quando nao ha tickets", () => {
    expect(buildTicketSummary([])).toEqual({
      open: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
      urgent: 0,
    });
  });
});
