import type { Request } from "express";
import type { Ticket } from "../types.js";

export interface TicketFilters {
  status?: string;
  category?: string;
  search?: string;
}

function toQueryString(
  value: Request["query"][string],
): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export function parseTicketFilters(
  query: Request["query"],
): TicketFilters {
  return {
    status: toQueryString(query.status),
    category: toQueryString(query.category),
    search: toQueryString(query.search),
  };
}

export function filterTickets(
  tickets: Ticket[],
  filters: TicketFilters,
): Ticket[] {
  let result = tickets;

  if (filters.status) {
    result = result.filter(
      (ticket) => ticket.status === filters.status,
    );
  }

  if (filters.category) {
    result = result.filter(
      (ticket) => ticket.category === filters.category,
    );
  }

  if (filters.search) {
    const search = filters.search.toLowerCase();
    result = result.filter(
      (ticket) =>
        ticket.title.toLowerCase().includes(search) ||
        ticket.description.toLowerCase().includes(search) ||
        ticket.category.toLowerCase().includes(search),
    );
  }

  return result;
}
