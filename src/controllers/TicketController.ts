import EventEmitter from "events";
import { Request, Response } from "express";
import { TicketStatus } from "../core/Ticket";
import { TicketFactory } from "../core/TicketFactory";
import { CommentRepository } from "../core/repositories/CommentRepository";
import { TicketRepository } from "../core/repositories/TicketRepository";
import { UserRepository } from "../core/repositories/UserRepository";

function generateId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

export class TicketController {
  constructor(
    private readonly tickets: TicketRepository,
    private readonly users: UserRepository,
    private readonly comments: CommentRepository,
    private readonly dispatcher: EventEmitter,
  ) {}

  list = (request: Request, response: Response) => {
    let tickets = this.tickets.findAll();

    if (request.query.status) {
      tickets = tickets.filter((ticket) => ticket.status === request.query.status);
    }

    if (request.query.category) {
      tickets = tickets.filter((ticket) => ticket.category === request.query.category);
    }

    if (request.query.search) {
      const search = String(request.query.search).toLowerCase();
      tickets = tickets.filter(
        (ticket) =>
          ticket.title.toLowerCase().includes(search) ||
          ticket.description.toLowerCase().includes(search) ||
          ticket.category.toLowerCase().includes(search),
      );
    }

    const result = tickets.map((ticket) => {
      const requester = this.users.findById(ticket.requesterId);
      const assigned = ticket.assignedToId ? this.users.findById(ticket.assignedToId) : undefined;
      const comments = this.comments.findByTicketId(ticket.id);

      return {
        ...ticket,
        requester,
        assigned,
        commentsCount: comments.length,
      };
    });

    response.json(result);
  };

  summary = (_request: Request, response: Response) => {
    const summary = {
      open: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
      urgent: 0,
    };

    for (const ticket of this.tickets.findAll()) {
      if (ticket.status === "open") summary.open++;
      if (ticket.status === "in_progress") summary.in_progress++;
      if (ticket.status === "resolved") summary.resolved++;
      if (ticket.status === "closed") summary.closed++;
      if (ticket.priority === "urgent") summary.urgent++;
    }

    response.json(summary);
  };

  getById = (request: Request, response: Response) => {
    const ticket = this.tickets.findById(String(request.params.id));

    if (!ticket) {
      response.status(404).json({ error: "Ticket nao encontrado", id: request.params.id });
      return;
    }

    const requester = this.users.findById(ticket.requesterId);
    const assigned = ticket.assignedToId ? this.users.findById(ticket.assignedToId) : undefined;
    const comments = this.comments.findByTicketId(ticket.id).map((comment) => ({
      ...comment,
      author: this.users.findById(comment.authorId),
    }));

    response.json({ ...ticket, requester, assigned, comments });
  };

  create = (request: Request, response: Response) => {
    const body = request.body;

    if (!body.title || !body.description || !body.category || !body.requesterId) {
      response.status(400).json({
        message: "Campos obrigatorios ausentes",
        required: ["title", "description", "category", "requesterId"],
        received: body,
      });
      return;
    }

    const user = this.users.findById(body.requesterId);
    if (!user) {
      response.status(400).json({ message: "Solicitante invalido" });
      return;
    }

    const now = new Date().toISOString();
    const ticket = TicketFactory.create({
      title: body.title,
      description: body.description,
      category: body.category,
      requesterId: body.requesterId,
      assignedToId: body.assignedToId,
      status: "open",
      createdAt: now,
      updatedAt: now,
    });

    this.tickets.add(ticket);

    this.dispatcher.emit("ticket.created", ticket);

    response.status(201).json(ticket);
  };

  updateStatus = (request: Request, response: Response) => {
    const ticket = this.tickets.findById(String(request.params.id));
    const newStatus = request.body.status as TicketStatus;

    if (!ticket) {
      response.status(404).json({ message: "Ticket nao encontrado" });
      return;
    }

    if (!["open", "in_progress", "resolved", "closed"].includes(newStatus)) {
      response.status(400).json({ message: "Status invalido", allowed: ["open", "in_progress", "resolved", "closed"] });
      return;
    }

    if (newStatus === "closed" && !request.body.comment) {
      response.status(400).json({ message: "Informe um comentario para fechar o chamado" });
      return;
    }

    ticket.status = newStatus;
    ticket.updatedAt = new Date().toISOString();

    if (request.body.comment) {
      this.comments.add({
        id: generateId("comment"),
        ticketId: ticket.id,
        authorId: request.body.authorId || ticket.requesterId,
        message: request.body.comment,
        createdAt: new Date().toISOString(),
      });
    }

    this.tickets.update(ticket);
    response.json(ticket);
  };

  addComment = (request: Request, response: Response) => {
    const ticket = this.tickets.findById(String(request.params.id));
    const body = request.body;

    if (!ticket) {
      response.status(404).json({ error: "Ticket nao encontrado" });
      return;
    }

    if (!body.message || !body.authorId) {
      response.status(400).json({ error: "Comentario e autor sao obrigatorios" });
      return;
    }

    const comment = {
      id: generateId("comment"),
      ticketId: ticket.id,
      authorId: body.authorId,
      message: body.message,
      createdAt: new Date().toISOString(),
    };

    this.comments.add(comment);
    ticket.updatedAt = new Date().toISOString();
    this.tickets.update(ticket);

    response.status(201).json(comment);
  };
}
