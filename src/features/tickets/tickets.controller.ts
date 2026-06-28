import type { Request, Response } from "express";
import { parseOrThrow } from "../../http/validate.js";
import { HttpStatus } from "../../http/http-status.js";
import type { Controller } from "../../domain/controller.js";
import { createTicketSchema } from "./dtos/create-ticket.dto.js";
import { createTicketCommentBodySchema } from "./dtos/create-ticket-comment.dto.js";
import { updateTicketStatusBodySchema } from "./dtos/update-ticket-status.dto.js";
import { parseTicketFilters } from "./utils/filter-tickets.js";
import type { TicketsService } from "./tickets.service.js";

function routeParam(value: string | string[]): string {
  return typeof value === "string" ? value : value[0];
}

export class TicketsController implements Controller {
  constructor(private readonly ticketsService: TicketsService) {}

  index(request: Request, response: Response): void {
    const result = this.ticketsService.list(
      parseTicketFilters(request.query),
    );

    response.status(HttpStatus.OK).json(result);
  }

  summary(_request: Request, response: Response): void {
    response
      .status(HttpStatus.OK)
      .json(this.ticketsService.summary());
  }

  show(request: Request, response: Response): void {
    response
      .status(HttpStatus.OK)
      .json(
        this.ticketsService.findById(routeParam(request.params.id)),
      );
  }

  store(request: Request, response: Response): void {
    const body = parseOrThrow(createTicketSchema, request.body);
    const ticket = this.ticketsService.create(body);

    response.status(HttpStatus.CREATED).json(ticket);
  }

  updateStatus(request: Request, response: Response): void {
    const body = parseOrThrow(
      updateTicketStatusBodySchema,
      request.body,
    );

    const ticket = this.ticketsService.updateStatus({
      ticketId: routeParam(request.params.id),
      ...body,
    });

    response.status(HttpStatus.OK).json(ticket);
  }

  storeComment(request: Request, response: Response): void {
    const body = parseOrThrow(
      createTicketCommentBodySchema,
      request.body,
    );

    const comment = this.ticketsService.addComment({
      ticketId: routeParam(request.params.id),
      ...body,
    });

    response.status(HttpStatus.CREATED).json(comment);
  }
}
