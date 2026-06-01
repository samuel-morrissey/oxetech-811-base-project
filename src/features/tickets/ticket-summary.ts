import type { Ticket } from "../../types/index.js";

export interface TicketSummary {
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
  urgent: number;
}

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
