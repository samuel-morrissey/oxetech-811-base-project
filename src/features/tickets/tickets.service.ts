import { BadRequest, NotFound } from "../../http/api-error.js";
import { generateId } from "../../utils/generate-id.js";
import type { Repository } from "../../domain/repository.js";
import type { Service } from "../../domain/service.js";
import type { User } from "../users/types/user.js";
import type { TicketsRepository } from "./tickets.repository.js";
import type { CreateTicketCommentDto } from "./dtos/create-ticket-comment.dto.js";
import type { CreateTicketDto } from "./dtos/create-ticket.dto.js";
import type { ListTicketsDto } from "./dtos/list-tickets.dto.js";
import type { UpdateTicketStatusDto } from "./dtos/update-ticket-status.dto.js";
import type { Ticket } from "./types/ticket.js";
import type { TicketComment } from "./types/ticket-comment.js";
import type { TicketSummary } from "./types/ticket-summary.js";
import { calculatePriority } from "./utils/calculate-priority.js";
import {
  enrichTicketForList,
  enrichTicketWithComments,
} from "./utils/enrich-ticket.js";
import { filterTickets } from "./utils/filter-tickets.js";
import { buildTicketSummary } from "./utils/ticket-summary.js";

export class TicketsService implements Service {
  constructor(
    private readonly ticketsRepository: TicketsRepository,
    private readonly usersRepository: Repository<User>,
  ) {}

  list(filters: ListTicketsDto) {
    const tickets = filterTickets(
      this.ticketsRepository.findAll(),
      filters,
    );

    return tickets.map((ticket) =>
      enrichTicketForList(
        this.ticketsRepository,
        this.usersRepository,
        ticket,
      ),
    );
  }

  summary(): TicketSummary {
    return buildTicketSummary(this.ticketsRepository.findAll());
  }

  findById(ticketId: string) {
    const ticket = this.ticketsRepository.findById(ticketId);

    if (!ticket) {
      throw new NotFound("Ticket nao encontrado", { id: ticketId });
    }

    return enrichTicketWithComments(
      this.ticketsRepository,
      this.usersRepository,
      ticket,
    );
  }

  create(input: CreateTicketDto): Ticket {
    const user = this.usersRepository.findById(input.requesterId);
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

    return this.ticketsRepository.create(ticket);
  }

  updateStatus(input: UpdateTicketStatusDto): Ticket {
    const ticket = this.ticketsRepository.findById(input.ticketId);

    if (!ticket) {
      throw new NotFound("Ticket nao encontrado", {
        id: input.ticketId,
      });
    }

    if (input.status === "closed" && !input.comment) {
      throw new BadRequest(
        "Informe um comentario para fechar o chamado",
      );
    }

    ticket.status = input.status;
    ticket.updatedAt = new Date().toISOString();

    if (input.comment) {
      this.ticketsRepository.createComment(
        {
          id: generateId("comment"),
          ticketId: ticket.id,
          authorId: input.authorId || ticket.requesterId,
          message: input.comment,
          createdAt: new Date().toISOString(),
        },
        ticket,
      );

      return ticket;
    }

    return this.ticketsRepository.save(ticket);
  }

  addComment(input: CreateTicketCommentDto): TicketComment {
    const ticket = this.ticketsRepository.findById(input.ticketId);

    if (!ticket) {
      throw new NotFound("Ticket nao encontrado", {
        id: input.ticketId,
      });
    }

    ticket.updatedAt = new Date().toISOString();

    return this.ticketsRepository.createComment(
      {
        id: generateId("comment"),
        ticketId: ticket.id,
        authorId: input.authorId,
        message: input.message,
        createdAt: new Date().toISOString(),
      },
      ticket,
    );
  }
}
