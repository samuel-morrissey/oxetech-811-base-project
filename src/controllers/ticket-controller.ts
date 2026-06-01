import type { Request, Response } from "express";
import { parseTicketFilters } from "../domain/filter-tickets.js";
import { HttpStatus } from "../http/http-status.js";
import type { TicketService } from "../services/ticket-service.js";
import type { Controller } from "./controller.js";

function getRouteParam(value: string | string[]): string {
  return typeof value === "string" ? value : value[0];
}

export class TicketController implements Controller {
  constructor(private readonly ticketService: TicketService) {}

  index(request: Request, response: Response): void {
    const result = this.ticketService.list(
      parseTicketFilters(request.query),
    );

    response.status(HttpStatus.OK).json(result);
  }

  summary(_request: Request, response: Response): void {
    response.status(HttpStatus.OK).json(this.ticketService.summary());
  }

  show(request: Request, response: Response): void {
    response
      .status(HttpStatus.OK)
      .json(
        this.ticketService.findById(getRouteParam(request.params.id)),
      );
  }

  store(request: Request, response: Response): void {
    const ticket = this.ticketService.create(request.body);

    response.status(HttpStatus.CREATED).json(ticket);
  }

  updateStatus(request: Request, response: Response): void {
    const ticket = this.ticketService.updateStatus({
      ticketId: getRouteParam(request.params.id),
      status: request.body.status,
      comment: request.body.comment,
      authorId: request.body.authorId,
    });

    response.status(HttpStatus.OK).json(ticket);
  }

  storeComment(request: Request, response: Response): void {
    const comment = this.ticketService.addComment({
      ticketId: getRouteParam(request.params.id),
      message: request.body.message,
      authorId: request.body.authorId,
    });

    response.status(HttpStatus.CREATED).json(comment);
  }
}
