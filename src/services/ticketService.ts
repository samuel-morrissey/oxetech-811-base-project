import {
  ID,
  PRIORITY_RULES,
  TICKET_CATEGORY,
  TICKET_PRIORITY,
  TICKET_STATUS,
} from "../constants";
import type {
  AddTicketCommentInput,
  CreateTicketInput,
  UpdateTicketStatusInput,
} from "../dtos/ticketDtos";
import {
  addComment,
  addTicket,
  buildCommentCountByTicket,
  buildUserMap,
  findAllTickets,
  findCommentsByTicketId,
  findTicketById,
  findUserById,
  loadDatabase,
  saveDatabase,
  touchTicket,
} from "../repositories/ticketRepository";
import type {
  AddTicketCommentResult,
  CreateTicketResult,
  Ticket,
  TicketComment,
  TicketDetail,
  TicketListFilters,
  TicketListItem,
  TicketPriority,
  UpdateTicketStatusResult,
  User,
} from "../types";
import { generateId } from "../utils/generateId";

function calculatePriority(category: string, description: string): TicketPriority {
  const normalizedDescription = description.toLowerCase();

  if (
    category === TICKET_CATEGORY.INFRA ||
    normalizedDescription.includes(PRIORITY_RULES.URGENT_KEYWORD)
  ) {
    return TICKET_PRIORITY.URGENT;
  }

  if (
    category === TICKET_CATEGORY.SISTEMAS ||
    description.length > PRIORITY_RULES.LONG_DESCRIPTION_THRESHOLD
  ) {
    return TICKET_PRIORITY.HIGH;
  }

  if (category === TICKET_CATEGORY.ACADEMICO) {
    return TICKET_PRIORITY.MEDIUM;
  }

  return TICKET_PRIORITY.LOW;
}

function filterTickets(tickets: Ticket[], filters: TicketListFilters): Ticket[] {
  let result = tickets;

  if (filters.status) {
    result = result.filter((ticket) => ticket.status === filters.status);
  }

  if (filters.category) {
    result = result.filter((ticket) => ticket.category === filters.category);
  }

  if (filters.search) {
    const normalizedSearch = filters.search.toLowerCase();
    result = result.filter(
      (ticket) =>
        ticket.title.toLowerCase().includes(normalizedSearch) ||
        ticket.description.toLowerCase().includes(normalizedSearch) ||
        ticket.category.toLowerCase().includes(normalizedSearch),
    );
  }

  return result;
}

function createCommentRecord(
  ticketId: string,
  authorId: string,
  message: string,
): TicketComment {
  return {
    id: generateId(ID.PREFIX.COMMENT),
    ticketId,
    authorId,
    message,
    createdAt: new Date().toISOString(),
  };
}

function toTicketListItem(
  ticket: Ticket,
  userMap: Map<string, User>,
  commentCounts: Map<string, number>,
): TicketListItem {
  return {
    ...ticket,
    requester: userMap.get(ticket.requesterId),
    assigned: ticket.assignedToId ? userMap.get(ticket.assignedToId) : undefined,
    commentsCount: commentCounts.get(ticket.id) ?? 0,
  };
}

export function listTickets(filters: TicketListFilters): TicketListItem[] {
  const database = loadDatabase();
  const userMap = buildUserMap(database);
  const commentCounts = buildCommentCountByTicket(database);
  const filteredTickets = filterTickets(findAllTickets(database), filters);

  return filteredTickets.map((ticket) => toTicketListItem(ticket, userMap, commentCounts));
}

export function getTicketById(id: string): TicketDetail | null {
  const database = loadDatabase();
  const ticket = findTicketById(database, id);

  if (!ticket) {
    return null;
  }

  const requester = findUserById(database, ticket.requesterId);
  const assigned = ticket.assignedToId ? findUserById(database, ticket.assignedToId) : undefined;
  const comments = findCommentsByTicketId(database, ticket.id).map((comment) => ({
    ...comment,
    author: findUserById(database, comment.authorId),
  }));

  return { ...ticket, requester, assigned, comments };
}

export function createTicket(input: CreateTicketInput): CreateTicketResult {
  const database = loadDatabase();

  if (!findUserById(database, input.requesterId)) {
    return { success: false, error: { code: "invalid_requester" } };
  }

  const now = new Date().toISOString();
  const ticket: Ticket = {
    id: generateId(ID.PREFIX.TICKET),
    title: input.title,
    description: input.description,
    category: input.category,
    requesterId: input.requesterId,
    assignedToId: input.assignedToId,
    status: TICKET_STATUS.OPEN,
    priority: calculatePriority(input.category, input.description),
    createdAt: now,
    updatedAt: now,
  };

  addTicket(database, ticket);
  saveDatabase(database);

  return { success: true, ticket };
}

export function updateTicketStatus(
  id: string,
  input: UpdateTicketStatusInput,
): UpdateTicketStatusResult {
  const database = loadDatabase();
  const ticket = findTicketById(database, id);

  if (!ticket) {
    return { success: false, error: { code: "not_found" } };
  }

  if (input.status === TICKET_STATUS.CLOSED && !input.comment) {
    return { success: false, error: { code: "comment_required_to_close" } };
  }

  ticket.status = input.status;
  touchTicket(ticket);

  if (input.comment) {
    addComment(
      database,
      createCommentRecord(
        ticket.id,
        input.authorId ?? ticket.requesterId,
        input.comment,
      ),
    );
  }

  saveDatabase(database);

  return { success: true, ticket };
}

export function addTicketComment(
  id: string,
  input: AddTicketCommentInput,
): AddTicketCommentResult {
  const database = loadDatabase();
  const ticket = findTicketById(database, id);

  if (!ticket) {
    return { success: false, error: { code: "not_found" } };
  }

  const comment = createCommentRecord(ticket.id, input.authorId, input.message);

  addComment(database, comment);
  touchTicket(ticket);
  saveDatabase(database);

  return { success: true, comment };
}
