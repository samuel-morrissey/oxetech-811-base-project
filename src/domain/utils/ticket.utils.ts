import type { Ticket, TicketPriority } from "../types";

export function generateId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

export function calculatePriority(category: string, description: string): TicketPriority {
  if (category === "infra" || description.toLowerCase().includes("urgente")) {
    return "urgent";
  }

  if (category === "sistemas" || description.length > 220) {
    return "high";
  }

  if (category === "academico") {
    return "medium";
  }

  return "low";
}

export function calculateTicketSummary(tickets: Ticket[]) {
  const summary = {
    open: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
    urgent: 0,
  };

  for (const ticket of tickets) {
    if (ticket.status === "open") summary.open++;
    if (ticket.status === "in_progress") summary.in_progress++;
    if (ticket.status === "resolved") summary.resolved++;
    if (ticket.status === "closed") summary.closed++;
    if (ticket.priority === "urgent") summary.urgent++;
  }

  return summary;
}

export function filterTickets(
  tickets: Ticket[],
  filters: { status?: string; category?: string; search?: string },
) {
  let filteredTickets = tickets;

  if (filters.status) {
    filteredTickets = filteredTickets.filter((ticket) => ticket.status === filters.status);
  }

  if (filters.category) {
    filteredTickets = filteredTickets.filter((ticket) => ticket.category === filters.category);
  }

  if (filters.search) {
    const search = String(filters.search).toLowerCase();
    filteredTickets = filteredTickets.filter(
      (ticket) =>
        ticket.title.toLowerCase().includes(search) ||
        ticket.description.toLowerCase().includes(search) ||
        ticket.category.toLowerCase().includes(search),
    );
  }

  return filteredTickets;
}
