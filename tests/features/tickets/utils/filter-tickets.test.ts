import { describe, expect, it } from "vitest";
import {
  filterTickets,
  parseTicketFilters,
} from "../../../../src/features/tickets/utils/filter-tickets.js";
import type { Ticket } from "../../../../src/features/tickets/types/ticket.js";

const tickets: Ticket[] = [
  {
    id: "ticket_1",
    title: "Erro de login",
    description: "Usuario nao consegue entrar",
    category: "sistemas",
    requesterId: "user_1",
    status: "open",
    priority: "high",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "ticket_2",
    title: "Impressora offline",
    description: "Infra da sala 12",
    category: "infra",
    requesterId: "user_2",
    status: "closed",
    priority: "urgent",
    createdAt: "2026-01-02T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
  },
];

describe("parseTicketFilters", () => {
  it("converte query string em filtros", () => {
    expect(
      parseTicketFilters({
        status: "open",
        category: "infra",
        search: "login",
      }),
    ).toEqual({
      status: "open",
      category: "infra",
      search: "login",
    });
  });

  it("ignora valores que nao sao string", () => {
    expect(
      parseTicketFilters({ status: ["open", "closed"] }),
    ).toEqual({
      status: undefined,
      category: undefined,
      search: undefined,
    });
  });
});

describe("filterTickets", () => {
  it("retorna todos os tickets sem filtros", () => {
    expect(filterTickets(tickets, {})).toEqual(tickets);
  });

  it("filtra por status", () => {
    expect(filterTickets(tickets, { status: "open" })).toEqual([
      tickets[0],
    ]);
  });

  it("filtra por category", () => {
    expect(filterTickets(tickets, { category: "infra" })).toEqual([
      tickets[1],
    ]);
  });

  it("filtra por search em title, description e category", () => {
    expect(filterTickets(tickets, { search: "login" })).toEqual([
      tickets[0],
    ]);
    expect(filterTickets(tickets, { search: "INFRA" })).toEqual([
      tickets[1],
    ]);
  });
});
