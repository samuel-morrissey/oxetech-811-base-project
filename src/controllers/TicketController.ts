import type { Request, Response, NextFunction } from "express";
import type { TicketService } from "../services/TicketService";

export class TicketController {
  constructor(private ticketService: TicketService) {}

  listTickets = (request: Request, response: Response, next: NextFunction): void => {
    try {
      const { status, category, search } = request.query;
      const tickets = this.ticketService.listTickets({
        status: status ? String(status) : undefined,
        category: category ? String(category) : undefined,
        search: search ? String(search) : undefined,
      });
      response.json(tickets);
    } catch (error) {
      next(error);
    }
  };

  getTicketSummary = (_request: Request, response: Response, next: NextFunction): void => {
    try {
      const summary = this.ticketService.getTicketSummary();
      response.json(summary);
    } catch (error) {
      next(error);
    }
  };

  getTicketDetail = (request: Request, response: Response, next: NextFunction): void => {
    try {
      const ticket = this.ticketService.getTicketDetail(request.params.id as string);
      response.json(ticket);
    } catch (error) {
      next(error);
    }
  };

  createTicket = (request: Request, response: Response, next: NextFunction): void => {
    try {
      const { title, description, category, requesterId, assignedToId } = request.body;
      const ticket = this.ticketService.createTicket({
        title,
        description,
        category,
        requesterId,
        assignedToId,
      });
      response.status(201).json(ticket);
    } catch (error) {
      next(error);
    }
  };

  updateTicketStatus = (request: Request, response: Response, next: NextFunction): void => {
    try {
      const { status, comment, authorId } = request.body;
      const ticket = this.ticketService.updateTicketStatus(request.params.id as string, {
        status,
        comment,
        authorId,
      });
      response.json(ticket);
    } catch (error) {
      next(error);
    }
  };

  addComment = (request: Request, response: Response, next: NextFunction): void => {
    try {
      const { message, authorId } = request.body;
      const comment = this.ticketService.addComment(request.params.id as string, {
        message,
        authorId,
      });
      response.status(201).json(comment);
    } catch (error) {
      next(error);
    }
  };
}
