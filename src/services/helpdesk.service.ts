import type { Database, Ticket, TicketComment, TicketStatus, User } from "../types";
import { generateId, readDatabase, writeDatabase } from "../repositories/database.repository";
import { calculatePriority } from "./ticket-priority.service";

export type FacadeResult<T = unknown> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; body: Record<string, unknown> };

type TicketListItem = ReturnType<typeof enrichTicketListItem>;
type TicketDetail = ReturnType<typeof enrichTicketDetail>;

type TicketsSummary = {
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
  urgent: number;
};

function enrichTicketListItem(database: Database, ticket: Ticket) {
  const requester = database.users.find((user) => user.id === ticket.requesterId);
  const assigned = database.users.find((user) => user.id === ticket.assignedToId);
  const comments = database.comments.filter((comment) => comment.ticketId === ticket.id);

  return {
    ...ticket,
    requester,
    assigned,
    commentsCount: comments.length,
  };
}

function enrichTicketDetail(database: Database, ticket: Ticket) {
  const requester = database.users.find((user) => user.id === ticket.requesterId);
  const assigned = database.users.find((user) => user.id === ticket.assignedToId);
  const comments = database.comments
    .filter((comment) => comment.ticketId === ticket.id)
    .map((comment) => ({
      ...comment,
      author: database.users.find((user) => user.id === comment.authorId),
    }));

  return { ...ticket, requester, assigned, comments };
}

function hasRequiredTicketFields(body: {
  title: string;
  description: string;
  category: string;
  requesterId: string;
  assignedToId?: string;
}): boolean {
  return Boolean(body.title && body.description && body.category && body.requesterId);
}

function requiredFieldsMissingResponse(body: {
  title?: string;
  description?: string;
  category?: string;
  requesterId?: string;
  assignedToId?: string;
}): FacadeResult<Ticket> {
  return { ok: false, status: 400, body: { message: "Campos obrigatorios ausentes", required: ["title", "description", "category", "requesterId"], received: body } };
}

function findUserOrFail(
  users: User[],
  id: string | undefined,
  notFoundMessage: string,
): FacadeResult<never> | null {
  const user = users.find((user) => user.id === id);
  if (!user) {
    return { ok: false, status: 400, body: { message: notFoundMessage } };
  }
  return null;
}

function buildNewTicket(body: {
  title: string;
  description: string;
  category: string;
  requesterId: string;
  assignedToId?: string;
}): Ticket {
  const now = new Date().toISOString();
  return {
    id: generateId("ticket"),
    title: body.title,
    description: body.description,
    category: body.category,
    requesterId: body.requesterId,
    assignedToId: body.assignedToId,
    status: "open",
    priority: calculatePriority(body.category, body.description),
    createdAt: now,
    updatedAt: now,
  };
}

function successfulCreatedResponse<T>(data: T): FacadeResult<T> {
  return { ok: true, status: 201, data };
}

function successfulOkResponse<T>(data: T): FacadeResult<T> {
  return { ok: true, status: 200, data };
}

function filterTicketsByStatusAndCategory(
  tickets: Ticket[],
  query: { status?: unknown; category?: unknown },
): Ticket[] {
  let filteredTickets = tickets;

  if (query.status) {
    filteredTickets = filteredTickets.filter((ticket) => ticket.status === query.status);
  }

  if (query.category) {
    filteredTickets = filteredTickets.filter((ticket) => ticket.category === query.category);
  }

  return filteredTickets;
}

function filterTicketsBySearch(tickets: Ticket[], search: string): Ticket[] {
  const normalizedSearch = search.toLowerCase();

  return tickets.filter(
    (ticket) =>
      ticket.title.toLowerCase().includes(normalizedSearch) ||
      ticket.description.toLowerCase().includes(normalizedSearch) ||
      ticket.category.toLowerCase().includes(normalizedSearch),
  );
}

function buildEnrichedTicketList(database: Database, tickets: Ticket[]): TicketListItem[] {
  return tickets.map((ticket) => enrichTicketListItem(database, ticket));
}

function countTicketsByStatus(
  tickets: Ticket[],
): { open: number; in_progress: number; resolved: number; closed: number } {
  const counts = {
    open: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
  };

  for (const ticket of tickets) {
    if (ticket.status === "open") counts.open++;
    if (ticket.status === "in_progress") counts.in_progress++;
    if (ticket.status === "resolved") counts.resolved++;
    if (ticket.status === "closed") counts.closed++;
  }

  return counts;
}

function countTicketsByPriority(tickets: Ticket[]): number {
  return tickets.filter((ticket) => ticket.priority === "urgent").length;
}

function findTicketById(tickets: Ticket[], id: string): Ticket | undefined {
  return tickets.find((item) => item.id === id);
}

function ticketNotFoundResponse(id: string): FacadeResult<TicketDetail> {
  return {
    ok: false,
    status: 404,
    body: { error: "Ticket nao encontrado", id },
  };
}

function isValidStatus(status: unknown): status is TicketStatus {
  return ["open", "in_progress", "resolved", "closed"].includes(String(status));
}

function invalidStatusResponse(): FacadeResult<Ticket> {
  return {
    ok: false,
    status: 400,
    body: {
      message: "Status invalido",
      allowed: ["open", "in_progress", "resolved", "closed"],
    },
  };
}

function requiresCommentForClosed(status: TicketStatus, comment?: string): boolean {
  return status === "closed" && !comment;
}

function missingCommentForClosedResponse(): FacadeResult<Ticket> {
  return {
    ok: false,
    status: 400,
    body: { message: "Informe um comentario para fechar o chamado" },
  };
}

function updateTicketWithStatus(ticket: Ticket, status: TicketStatus): void {
  ticket.status = status;
  ticket.updatedAt = new Date().toISOString();
}

function addCommentIfProvided(
  database: Database,
  ticket: Ticket,
  comment?: string,
  authorId?: string,
): void {
  if (comment) {
    database.comments.push({
      id: generateId("comment"),
      ticketId: ticket.id,
      authorId: authorId || ticket.requesterId,
      message: comment,
      createdAt: new Date().toISOString(),
    });
  }
}

function hasRequiredCommentFields(body: {
  message?: string;
  authorId?: string;
}): boolean {
  return Boolean(body.message && body.authorId);
}

function missingCommentFieldsResponse(): FacadeResult<TicketComment> {
  return {
    ok: false,
    status: 400,
    body: { error: "Comentario e autor sao obrigatorios" },
  };
}

function buildComment(ticketId: string, message: string, authorId: string): TicketComment {
  return {
    id: generateId("comment"),
    ticketId,
    authorId,
    message,
    createdAt: new Date().toISOString(),
  };
}

export const helpdeskService = {
  listUsers(): FacadeResult<User[]> {
    const database = readDatabase();
    return { ok: true, status: 200, data: database.users };
  },

  listTickets(query: {
    status?: unknown;
    category?: unknown;
    search?: unknown;
  }): FacadeResult<TicketListItem[]> {
    const database = readDatabase();
    let filteredTickets = filterTicketsByStatusAndCategory(database.tickets, query);

    if (query.search) {
      filteredTickets = filterTicketsBySearch(filteredTickets, String(query.search));
    }

    const ticketList = buildEnrichedTicketList(database, filteredTickets);

    return successfulOkResponse(ticketList);
  },

  getTicketsSummary(): FacadeResult<TicketsSummary> {
    const database = readDatabase();
    const statusCounts = countTicketsByStatus(database.tickets);
    const urgentCount = countTicketsByPriority(database.tickets);

    const summary: TicketsSummary = {
      ...statusCounts,
      urgent: urgentCount,
    };

    return successfulOkResponse(summary);
  },

  getTicketById(id: string): FacadeResult<TicketDetail> {
    const database = readDatabase();
    const ticket = findTicketById(database.tickets, id);

    if (!ticket) {
      return ticketNotFoundResponse(id);
    }

    const detail = enrichTicketDetail(database, ticket);
    return successfulOkResponse(detail);
  },

  createTicket(body: {
    title: string;
    description: string;
    category: string;
    requesterId: string;
    assignedToId?: string;
  }): FacadeResult<Ticket> {
    const database = readDatabase();

    if (!hasRequiredTicketFields(body)) {
      return requiredFieldsMissingResponse(body);
    }

    const requesterError = findRequesterOrFail(database.users, body.requesterId);
    if (requesterError) {
      return requesterError;
    }

    const newTicket: Ticket = buildNewTicket(body);

    database.tickets.push(newTicket);
    writeDatabase(database);

    return successfulCreatedResponse(newTicket);
  },

  updateTicketStatus(
    id: string,
    body: { status?: TicketStatus; comment?: string; authorId?: string },
  ): FacadeResult<Ticket> {
    const database = readDatabase();
    const ticket = findTicketById(database.tickets, id);

    if (!ticket) {
      return { ok: false, status: 404, body: { message: "Ticket nao encontrado" } };
    }

    if (!isValidStatus(body.status)) {
      return invalidStatusResponse();
    }

    if (requiresCommentForClosed(body.status, body.comment)) {
      return missingCommentForClosedResponse();
    }

    updateTicketWithStatus(ticket, body.status);
    addCommentIfProvided(database, ticket, body.comment, body.authorId);

    writeDatabase(database);
    return successfulOkResponse(ticket);
  },

  addComment(
    id: string,
    body: { message?: string; authorId?: string },
  ): FacadeResult<TicketComment> {
    const database = readDatabase();
    const ticket = findTicketById(database.tickets, id);

    if (!ticket) {
      return { ok: false, status: 404, body: { error: "Ticket nao encontrado" } };
    }

    if (!hasRequiredCommentFields(body)) {
      return missingCommentFieldsResponse();
    }

    const comment = buildComment(ticket.id, body.message as string, body.authorId as string);

    database.comments.push(comment);
    ticket.updatedAt = new Date().toISOString();
    writeDatabase(database);

    return successfulCreatedResponse(comment);
  },
};
