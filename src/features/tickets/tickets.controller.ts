import type { Request, Response } from "express";
import { routeParam } from "../../http/route-param.js";
import { HttpStatus } from "../../http/http-status.js";
import type { Controller } from "../../domain/controller.js";
import type { CreateTicketCommentBody } from "./dtos/create-ticket-comment.dto.js";
import type { CreateTicketDto } from "./dtos/create-ticket.dto.js";
import type { UpdateTicketStatusBody } from "./dtos/update-ticket-status.dto.js";
import type { TicketsService } from "./tickets.service.js";

export class TicketsController implements Controller {
  constructor(private readonly ticketsService: TicketsService) {}

  index(_request: Request, response: Response): void {
    const filters = response.locals.validatedQuery ?? {};
    const result = this.ticketsService.list(filters);

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
    const body = request.body as CreateTicketDto;
    const ticket = this.ticketsService.create(body);

    response.status(HttpStatus.CREATED).json(ticket);
  }

  updateStatus(request: Request, response: Response): void {
    const body = request.body as UpdateTicketStatusBody;

    const ticket = this.ticketsService.updateStatus({
      ticketId: routeParam(request.params.id),
      ...body,
    });

    response.status(HttpStatus.OK).json(ticket);
  }

  storeComment(request: Request, response: Response): void {
    const body = request.body as CreateTicketCommentBody;

    const comment = this.ticketsService.addComment({
      ticketId: routeParam(request.params.id),
      ...body,
    });

    response.status(HttpStatus.CREATED).json(comment);
  }
}
