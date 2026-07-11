import { Router } from "express";
import { UserRepository } from "./repositories/UserRepository";
import { TicketRepository } from "./repositories/TicketRepository";
import { UserService } from "./services/UserService";
import { TicketService } from "./services/TicketService";
import { UserController } from "./controllers/UserController";
import { TicketController } from "./controllers/TicketController";
import {
  validateBody,
  validateCreateTicket,
  validateUpdateStatus,
  validateCreateComment,
} from "./middlewares/validation.middleware";

const router = Router();

// Instanciação das dependências (Injeção de dependências manual)
const userRepository = new UserRepository();
const ticketRepository = new TicketRepository();

const userService = new UserService(userRepository);
const ticketService = new TicketService(ticketRepository, userRepository);

const userController = new UserController(userService);
const ticketController = new TicketController(ticketService);

// Healthcheck
router.get("/health", (_request, response) => {
  response.json({ status: "ok", service: "oxetech-helpdesk" });
});

// Rotas de Usuário
router.get("/users", userController.listUsers);

// Rotas de Ticket
router.get("/tickets", ticketController.listTickets);
router.get("/tickets/summary", ticketController.getTicketSummary);
router.get("/tickets/:id", ticketController.getTicketDetail);
router.post("/tickets", validateBody(validateCreateTicket), ticketController.createTicket);
router.patch("/tickets/:id/status", validateBody(validateUpdateStatus), ticketController.updateTicketStatus);
router.post("/tickets/:id/comments", validateBody(validateCreateComment), ticketController.addComment);

export default router;