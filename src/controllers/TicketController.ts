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

  list = async (request: Request, response: Response) => {
    let tickets = await this.tickets.findAll();

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

    const result = await Promise.all(
      tickets.map(async (ticket) => {
        const requester = await this.users.findById(ticket.requesterId);
        const assigned = ticket.assignedToId ? await this.users.findById(ticket.assignedToId) : undefined;
        const comments = await this.comments.findByTicketId(ticket.id);

        return {
          ...ticket,
          requester,
          assigned,
          commentsCount: comments.length,
        };
      }),
    );

    response.json(result);
  };

  summary = async (_request: Request, response: Response) => {
    const summary = {
      open: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
      urgent: 0,
    };

    for (const ticket of await this.tickets.findAll()) {
      if (ticket.status === "open") summary.open++;
      if (ticket.status === "in_progress") summary.in_progress++;
      if (ticket.status === "resolved") summary.resolved++;
      if (ticket.status === "closed") summary.closed++;
      if (ticket.priority === "urgent") summary.urgent++;
    }

    response.json(summary);
  };

  getById = async (request: Request, response: Response) => {
    const ticket = await this.tickets.findById(String(request.params.id));

    if (!ticket) {
      response.status(404).json({ error: "Ticket nao encontrado", id: request.params.id });
      return;
    }

    const requester = await this.users.findById(ticket.requesterId);
    const assigned = ticket.assignedToId ? await this.users.findById(ticket.assignedToId) : undefined;
    const rawComments = await this.comments.findByTicketId(ticket.id);
    const comments = await Promise.all(
      rawComments.map(async (comment) => ({
        ...comment,
        author: await this.users.findById(comment.authorId),
      })),
    );

    response.json({ ...ticket, requester, assigned, comments });
  };

  create = async (request: Request, response: Response) => {
    const body = request.body;

    if (!body.title || !body.description || !body.category) {
      response.status(400).json({
        message: "Campos obrigatorios ausentes",
        required: ["title", "description", "category"],
        received: body,
      });
      return;
    }

    // Autoria: o solicitante e sempre o usuario autenticado (nao vem do body).
    const requester = request.user!;

    const now = new Date().toISOString();
    const ticket = TicketFactory.create({
      title: body.title,
      description: body.description,
      category: body.category,
      requesterId: requester.id,
      assignedToId: body.assignedToId,
      status: "open",
      createdAt: now,
      updatedAt: now,
    });

    await this.tickets.add(ticket);

    this.dispatcher.emit("ticket.created", ticket);

    response.status(201).json(ticket);
  };

  updateStatus = async (request: Request, response: Response) => {
    const ticket = await this.tickets.findById(String(request.params.id));
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
      await this.comments.add({
        id: generateId("comment"),
        ticketId: ticket.id,
        // Autoria: o comentario e do usuario autenticado que mudou o status.
        authorId: request.user!.id,
        message: request.body.comment,
        createdAt: new Date().toISOString(),
      });
    }

    await this.tickets.update(ticket);
    response.json(ticket);
  };

  addComment = async (request: Request, response: Response) => {
    const ticket = await this.tickets.findById(String(request.params.id));
    const body = request.body;

    if (!ticket) {
      response.status(404).json({ error: "Ticket nao encontrado" });
      return;
    }

    if (!body.message) {
      response.status(400).json({ error: "Comentario e obrigatorio" });
      return;
    }

    const comment = {
      id: generateId("comment"),
      ticketId: ticket.id,
      // Autoria: o comentario e sempre do usuario autenticado.
      authorId: request.user!.id,
      message: body.message,
      createdAt: new Date().toISOString(),
    };

    await this.comments.add(comment);
    ticket.updatedAt = new Date().toISOString();
    await this.tickets.update(ticket);

    response.status(201).json(comment);
  };
}
