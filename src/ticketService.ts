import { findCommentsByTicketId, saveComment } from "./commentRepository";
import { findAllTickets, findTicketById, saveTicket, updateTicket, updateTicketWithComment } from "./ticketRepository";
import { findUserById } from "./userRepository";
import type { Ticket, TicketComment, TicketPriority, TicketStatus } from "./types";

const DESCRIPTION_LENGTH_HIGH_PRIORITY = 220;

export interface TicketFilters {
  status?: string;
  category?: string;
  search?: string;
}

export interface CreateTicketInput {
  title: string;
  description: string;
  category: string;
  requesterId: string;
  assignedToId?: string;
}

export interface UpdateStatusInput {
  status: TicketStatus;
  authorId?: string;
  comment?: string;
}

export interface AddCommentInput {
  authorId: string;
  message: string;
}

function generateId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

export function calculatePriority(category: string, description: string): TicketPriority {
  if (category === "infra" || description.toLowerCase().includes("urgente")) {
    return "urgent";
  }

  if (category === "sistemas" || description.length > DESCRIPTION_LENGTH_HIGH_PRIORITY) {
    return "high";
  }

  if (category === "academico") {
    return "medium";
  }

  return "low";
}

export function listTickets(filters: TicketFilters = {}) {
  let tickets = findAllTickets();

  if (filters.status) {
    tickets = tickets.filter((ticket) => ticket.status === filters.status);
  }

  if (filters.category) {
    tickets = tickets.filter((ticket) => ticket.category === filters.category);
  }

  if (filters.search) {
    const search = filters.search.toLowerCase();
    tickets = tickets.filter(
      (ticket) =>
        ticket.title.toLowerCase().includes(search) ||
        ticket.description.toLowerCase().includes(search) ||
        ticket.category.toLowerCase().includes(search),
    );
  }

  return tickets.map((ticket) => {
    const requester = findUserById(ticket.requesterId);
    const assigned = ticket.assignedToId ? findUserById(ticket.assignedToId) : undefined;
    const comments = findCommentsByTicketId(ticket.id);

    return {
      ...ticket,
      requester,
      assigned,
      commentsCount: comments.length,
    };
  });
}

export function getTicketsSummary() {
  const tickets = findAllTickets();
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

export function getTicketDetails(id: string) {
  const ticket = findTicketById(id);

  if (!ticket) {
    return undefined;
  }

  const requester = findUserById(ticket.requesterId);
  const assigned = ticket.assignedToId ? findUserById(ticket.assignedToId) : undefined;
  const comments = findCommentsByTicketId(ticket.id).map((comment) => ({
    ...comment,
    author: findUserById(comment.authorId),
  }));

  return { ...ticket, requester, assigned, comments };
}

export function createTicket(input: CreateTicketInput): Ticket {
  const now = new Date().toISOString();
  const ticket: Ticket = {
    id: generateId("ticket"),
    title: input.title,
    description: input.description,
    category: input.category,
    requesterId: input.requesterId,
    assignedToId: input.assignedToId,
    status: "open",
    priority: calculatePriority(input.category, input.description),
    createdAt: now,
    updatedAt: now,
  };

  saveTicket(ticket);
  return ticket;
}

export function updateTicketStatus(id: string, input: UpdateStatusInput): Ticket | undefined {
  const ticket = findTicketById(id);

  if (!ticket) {
    return undefined;
  }

  const updatedTicket: Ticket = {
    ...ticket,
    status: input.status,
    updatedAt: new Date().toISOString(),
  };

  let comment: TicketComment | undefined;

  if (input.comment) {
    comment = {
      id: generateId("comment"),
      ticketId: ticket.id,
      authorId: input.authorId || ticket.requesterId,
      message: input.comment,
      createdAt: new Date().toISOString(),
    };
  }

  updateTicketWithComment(updatedTicket, comment);
  return updatedTicket;
}

export function addTicketComment(id: string, input: AddCommentInput): TicketComment | undefined {
  const ticket = findTicketById(id);

  if (!ticket) {
    return undefined;
  }

  const comment: TicketComment = {
    id: generateId("comment"),
    ticketId: ticket.id,
    authorId: input.authorId,
    message: input.message,
    createdAt: new Date().toISOString(),
  };

  saveComment(comment);
  updateTicket({
    ...ticket,
    updatedAt: new Date().toISOString(),
  });

  return comment;
}
