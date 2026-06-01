import type { TicketSummary } from "../types/ticket-summary.js";
import type { Ticket } from "../types/ticket.js";

export function buildTicketSummary(tickets: Ticket[]): TicketSummary {
  const summary: TicketSummary = {
    open: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
    urgent: 0,
  };

  for (const ticket of tickets) {
    summary[ticket.status]++;
    if (ticket.priority === "urgent") {
      summary.urgent++;
    }
  }

  return summary;
}
