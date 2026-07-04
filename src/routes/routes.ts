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