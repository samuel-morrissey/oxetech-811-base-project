import type { Request, Response } from "express";
import { HttpStatus } from "../../http/http-status.js";
import type { Controller } from "../../domain/controller.js";
import { parseTicketFilters } from "./utils/filter-tickets.js";
import type { TicketsService } from "./tickets.service.js";

type TicketRouteParams = {
  id: string;
};

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

  show(
    request: Request<TicketRouteParams>,
    response: Response,
  ): void {
    response
      .status(HttpStatus.OK)
      .json(this.ticketsService.findById(request.params.id));
  }

  store(request: Request, response: Response): void {
    const ticket = this.ticketsService.create(request.body);

    response.status(HttpStatus.CREATED).json(ticket);
  }

  updateStatus(
    request: Request<TicketRouteParams>,
    response: Response,
  ): void {
    const ticket = this.ticketsService.updateStatus({
      ticketId: request.params.id,
      status: request.body.status,
      comment: request.body.comment,
      authorId: request.body.authorId,
    });

    response.status(HttpStatus.OK).json(ticket);
  }

  storeComment(
    request: Request<TicketRouteParams>,
    response: Response,
  ): void {
    const comment = this.ticketsService.addComment({
      ticketId: request.params.id,
      message: request.body.message,
      authorId: request.body.authorId,
    });

    response.status(HttpStatus.CREATED).json(comment);
  }
}
