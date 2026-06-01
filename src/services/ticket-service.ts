import {
  readDatabase,
  writeDatabase,
} from "../database/jsonDatabase.js";
import { calculatePriority } from "../domain/calculate-priority.js";
import {
  enrichTicketForList,
  enrichTicketWithComments,
} from "../domain/enrich-ticket.js";
import {
  filterTickets,
  type TicketFilters,
} from "../domain/filter-tickets.js";
import { findUserById } from "../domain/find-user-by-id.js";
import {
  isValidTicketStatus,
  TICKET_STATUSES,
  type TicketStatus,
} from "../domain/ticket-status.js";
import {
  buildTicketSummary,
  type TicketSummary,
} from "../domain/ticket-summary.js";
import { BadRequest, NotFound } from "../http/api-error.js";
import type { Ticket, TicketComment } from "../types.js";
import { generateId } from "../utils/generate-id.js";

export interface CreateTicketInput {
  title: string;
  description: string;
  category: string;
  requesterId: string;
  assignedToId?: string;
}

export interface UpdateTicketStatusInput {
  ticketId: string;
  status: string;
  comment?: string;
  authorId?: string;
}

export interface CreateTicketCommentInput {
  ticketId: string;
  message: string;
  authorId: string;
}

export class TicketService {
  list(filters: TicketFilters) {
    const database = readDatabase();
    const tickets = filterTickets(database.tickets, filters);

    return tickets.map((ticket) =>
      enrichTicketForList(database, ticket),
    );
  }

  summary(): TicketSummary {
    const database = readDatabase();

    return buildTicketSummary(database.tickets);
  }

  findById(ticketId: string) {
    const database = readDatabase();
    const ticket = database.tickets.find(
      (item) => item.id === ticketId,
    );

    if (!ticket) {
      throw new NotFound("Ticket nao encontrado", { id: ticketId });
    }

    return enrichTicketWithComments(database, ticket);
  }

  create(input: CreateTicketInput): Ticket {
    const database = readDatabase();

    if (
      !input.title ||
      !input.description ||
      !input.category ||
      !input.requesterId
    ) {
      throw new BadRequest("Campos obrigatorios ausentes", {
        required: ["title", "description", "category", "requesterId"],
        received: {
          title: input.title,
          description: input.description,
          category: input.category,
          requesterId: input.requesterId,
        },
      });
    }

    const user = findUserById(database, input.requesterId);
    if (!user) {
      throw new BadRequest("Solicitante invalido");
    }

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

    database.tickets.push(ticket);
    writeDatabase(database);

    return ticket;
  }

  updateStatus(input: UpdateTicketStatusInput): Ticket {
    const database = readDatabase();
    const ticket = database.tickets.find(
      (item) => item.id === input.ticketId,
    );

    if (!ticket) {
      throw new NotFound("Ticket nao encontrado");
    }

    if (!isValidTicketStatus(input.status)) {
      throw new BadRequest("Status invalido", {
        allowed: [...TICKET_STATUSES],
      });
    }

    const newStatus: TicketStatus = input.status;

    if (newStatus === "closed" && !input.comment) {
      throw new BadRequest(
        "Informe um comentario para fechar o chamado",
      );
    }

    ticket.status = newStatus;
    ticket.updatedAt = new Date().toISOString();

    if (input.comment) {
      database.comments.push({
        id: generateId("comment"),
        ticketId: ticket.id,
        authorId: input.authorId || ticket.requesterId,
        message: input.comment,
        createdAt: new Date().toISOString(),
      });
    }

    writeDatabase(database);

    return ticket;
  }

  addComment(input: CreateTicketCommentInput): TicketComment {
    const database = readDatabase();
    const ticket = database.tickets.find(
      (item) => item.id === input.ticketId,
    );

    if (!ticket) {
      throw new NotFound("Ticket nao encontrado");
    }

    if (!input.message || !input.authorId) {
      throw new BadRequest("Comentario e autor sao obrigatorios");
    }

    const comment: TicketComment = {
      id: generateId("comment"),
      ticketId: ticket.id,
      authorId: input.authorId,
      message: input.message,
      createdAt: new Date().toISOString(),
    };

    database.comments.push(comment);
    ticket.updatedAt = new Date().toISOString();
    writeDatabase(database);

    return comment;
  }
}
