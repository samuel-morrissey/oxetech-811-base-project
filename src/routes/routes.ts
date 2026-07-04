import { Router } from "express";
import type { Ticket, TicketStatus } from "../types";
import { DatabaseManager } from "../repository";
import { TicketController } from "../controllers/TicketController";
import { TicketFactory } from "../services/TicketFactory";

const router = Router();

router.get("/health", TicketController.getHealth);
router.get("/users", TicketController.getAllUsers);
router.get("/tickets", TicketController.getAllTickets);
router.get("/tickets/summary", TicketController.getSummary);
router.get("/tickets/:id", TicketController.getTicketById);
router.post("/tickets", TicketController.postTicket);
router.patch("/tickets/:id/status", TicketController.patchTicketStatus);

/*
router.patch("/tickets/:id/status", (request, response) => {
  const database = DatabaseManager.getInstance().readDatabase();
  const ticket = database.tickets.find((item) => item.id === request.params.id);
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
    database.comments.push({
      id: DatabaseManager.generateId("comment"),
      ticketId: ticket.id,
      authorId: request.body.authorId || ticket.requesterId,
      message: request.body.comment,
      createdAt: new Date().toISOString(),
    });
  }

  DatabaseManager.getInstance().writeDatabase(database);
  response.json(ticket);
});

*/

router.post("/tickets/:id/comments", (request, response) => {
  const database = DatabaseManager.getInstance().readDatabase();
  const ticket = database.tickets.find((item) => item.id === request.params.id);
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
    id: DatabaseManager.generateId("comment"),
    ticketId: ticket.id,
    authorId: body.authorId,
    message: body.message,
    createdAt: new Date().toISOString(),
  };

  database.comments.push(comment);
  ticket.updatedAt = new Date().toISOString();
  DatabaseManager.getInstance().writeDatabase(database);

  response.status(201).json(comment);
});

export default router;