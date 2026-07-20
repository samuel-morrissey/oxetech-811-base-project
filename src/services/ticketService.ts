import { TICKET_STATUS } from "../constants";
import type {
  AddTicketCommentInput,
  CreateTicketInput,
  UpdateTicketStatusInput,
} from "../dtos/ticketDtos";
import {
  jsonTicketRepository,
  type TicketRepository,
} from "../repositories/ticketRepository";
import type {
  AddTicketCommentResult,
  CreateTicketResult,
  Ticket,
  TicketDetail,
  TicketListFilters,
  TicketListItem,
  UpdateTicketStatusResult,
  User,
} from "../types";
import { makeComment, makeTicket } from "./ticketFactory";

export interface TicketService {
  listTickets(filters: TicketListFilters): TicketListItem[];
  getTicketById(id: string): TicketDetail | null;
  createTicket(input: CreateTicketInput): CreateTicketResult;
  updateTicketStatus(
    id: string,
    input: UpdateTicketStatusInput,
  ): UpdateTicketStatusResult;
  addTicketComment(
    id: string,
    input: AddTicketCommentInput,
  ): AddTicketCommentResult;
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

/**
 * Service factory: aceita um TicketRepository via parametro (Dependency Injection).
 * Facilita substituicao em testes e desacopla logica de negocio do storage concreto.
 * Ver docs/DESIGN_PATTERNS.md#2-repository-interface.
 */
export function createTicketService(repo: TicketRepository): TicketService {
  function listTickets(filters: TicketListFilters): TicketListItem[] {
    const database = repo.load();
    const userMap = repo.buildUserMap(database);
    const commentCounts = repo.buildCommentCountByTicket(database);
    const filteredTickets = filterTickets(
      repo.findAllTickets(database),
      filters,
    );

    return filteredTickets.map((ticket) =>
      toTicketListItem(ticket, userMap, commentCounts),
    );
  }

  function getTicketById(id: string): TicketDetail | null {
    const database = repo.load();
    const ticket = repo.findTicketById(database, id);

    if (!ticket) {
      return null;
    }

    const requester = repo.findUserById(database, ticket.requesterId);
    const assigned = ticket.assignedToId
      ? repo.findUserById(database, ticket.assignedToId)
      : undefined;
    const comments = repo
      .findCommentsByTicketId(database, ticket.id)
      .map((comment) => ({
        ...comment,
        author: repo.findUserById(database, comment.authorId),
      }));

    return { ...ticket, requester, assigned, comments };
  }

  function createTicket(input: CreateTicketInput): CreateTicketResult {
    const database = repo.load();

    if (!repo.findUserById(database, input.requesterId)) {
      return { success: false, error: { code: "invalid_requester" } };
    }

    const ticket = makeTicket(input, new Date().toISOString());
    repo.addTicket(database, ticket);
    repo.save(database);

    return { success: true, ticket };
  }

  function updateTicketStatus(
    id: string,
    input: UpdateTicketStatusInput,
  ): UpdateTicketStatusResult {
    const database = repo.load();
    const ticket = repo.findTicketById(database, id);

    if (!ticket) {
      return { success: false, error: { code: "not_found" } };
    }

    if (input.status === TICKET_STATUS.CLOSED && !input.comment) {
      return { success: false, error: { code: "comment_required_to_close" } };
    }

    ticket.status = input.status;
    repo.touchTicket(ticket);

    if (input.comment) {
      repo.addComment(
        database,
        makeComment(
          {
            ticketId: ticket.id,
            authorId: input.authorId ?? ticket.requesterId,
            message: input.comment,
          },
          new Date().toISOString(),
        ),
      );
    }

    repo.save(database);

    return { success: true, ticket };
  }

  function addTicketComment(
    id: string,
    input: AddTicketCommentInput,
  ): AddTicketCommentResult {
    const database = repo.load();
    const ticket = repo.findTicketById(database, id);

    if (!ticket) {
      return { success: false, error: { code: "not_found" } };
    }

    const comment = makeComment(
      {
        ticketId: ticket.id,
        authorId: input.authorId,
        message: input.message,
      },
      new Date().toISOString(),
    );

    repo.addComment(database, comment);
    repo.touchTicket(ticket);
    repo.save(database);

    return { success: true, comment };
  }

  return {
    listTickets,
    getTicketById,
    createTicket,
    updateTicketStatus,
    addTicketComment,
  };
}

const defaultService = createTicketService(jsonTicketRepository);

export const listTickets = defaultService.listTickets;
export const getTicketById = defaultService.getTicketById;
export const createTicket = defaultService.createTicket;
export const updateTicketStatus = defaultService.updateTicketStatus;
export const addTicketComment = defaultService.addTicketComment;
