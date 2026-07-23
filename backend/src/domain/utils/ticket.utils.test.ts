import { describe, it, expect } from "vitest";
import { calculatePriority, calculateTicketSummary, filterTickets } from "./ticket.utils";
import type { Ticket } from "../types";

describe("ticket.utils", () => {
  describe("calculatePriority", () => {
    it("should return urgent for infra category", () => {
      const priority = calculatePriority("infra", "Nao liga o ar condicionado");
      expect(priority).toBe("urgent");
    });

    it("should return urgent if description contains urgente", () => {
      const priority = calculatePriority("sistemas", "Problema urgente com login");
      expect(priority).toBe("urgent");
    });

    it("should return high for sistemas category", () => {
      const priority = calculatePriority("sistemas", "Nao consigo acessar");
      expect(priority).toBe("high");
    });

    it("should return high if description is longer than 220 chars", () => {
      const longDescription = "a".repeat(221);
      const priority = calculatePriority("academico", longDescription);
      expect(priority).toBe("high");
    });

    it("should return medium for academico category", () => {
      const priority = calculatePriority("academico", "Duvida com matricula");
      expect(priority).toBe("medium");
    });

    it("should return low for other categories", () => {
      const priority = calculatePriority("outros" as any, "Outro assunto");
      expect(priority).toBe("low");
    });
  });

  describe("calculateTicketSummary", () => {
    it("should count statuses and urgent priorities correctly", () => {
      const tickets: Ticket[] = [
        {
          id: "1",
          title: "t1",
          description: "d1",
          category: "infra",
          status: "open",
          priority: "urgent",
          requesterId: "u1",
          createdAt: "",
          updatedAt: "",
        },
        {
          id: "2",
          title: "t2",
          description: "d2",
          category: "sistemas",
          status: "in_progress",
          priority: "high",
          requesterId: "u1",
          createdAt: "",
          updatedAt: "",
        },
        {
          id: "3",
          title: "t3",
          description: "d3",
          category: "academico",
          status: "resolved",
          priority: "medium",
          requesterId: "u1",
          createdAt: "",
          updatedAt: "",
        },
      ];

      const summary = calculateTicketSummary(tickets);
      expect(summary).toEqual({
        open: 1,
        in_progress: 1,
        resolved: 1,
        closed: 0,
        urgent: 1,
      });
    });
  });

  describe("filterTickets", () => {
    const tickets: Ticket[] = [
      {
        id: "1",
        title: "Login nao funciona",
        description: "Erro de credencial",
        category: "sistemas",
        status: "open",
        priority: "high",
        requesterId: "u1",
        createdAt: "",
        updatedAt: "",
      },
      {
        id: "2",
        title: "Ar condicionado quebrado",
        description: "Sala 101",
        category: "infra",
        status: "in_progress",
        priority: "urgent",
        requesterId: "u2",
        createdAt: "",
        updatedAt: "",
      },
    ];

    it("should filter by status", () => {
      const result = filterTickets(tickets, { status: "open" });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });

    it("should filter by category", () => {
      const result = filterTickets(tickets, { category: "infra" });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("2");
    });

    it("should filter by search term in title or description", () => {
      const result = filterTickets(tickets, { search: "ar condicionado" });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("2");
    });
  });
});
