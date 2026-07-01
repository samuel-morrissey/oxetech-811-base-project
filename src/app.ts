import EventEmitter from "events";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";
import { AuthController } from "./controllers/AuthController";
import { HealthController } from "./controllers/HealthController";
import { TicketController } from "./controllers/TicketController";
import { UserController } from "./controllers/UserController";
import type { CommentRepository } from "./core/repositories/CommentRepository";
import type { TicketRepository } from "./core/repositories/TicketRepository";
import type { UserRepository } from "./core/repositories/UserRepository";
import { createAuthMiddleware } from "./middleware/authMiddleware";
import { createRouter } from "./routes/routes";
import type { Mailer } from "./services/email/EmailService";

export interface AppDependencies {
  userRepository: UserRepository;
  ticketRepository: TicketRepository;
  commentRepository: CommentRepository;
  emailService: Mailer;
}

export function createApp(deps: AppDependencies): Express {
  const dispatcher = new EventEmitter();

  dispatcher.on("ticket.created", (ticket) => {
    deps.emailService
      .sendEmail("admin@oxetech.com", "Novo Ticket Criado", `Um novo ticket foi criado: ${ticket.title}`)
      .catch((error) => console.error("Falha ao enviar email:", error));
  });

  dispatcher.on("ticket.created", (ticket) => {
    console.info(`Evento recebido: ticket.created - ${ticket.title}`);
  });

  const healthController = new HealthController();
  const authController = new AuthController(deps.userRepository);
  const userController = new UserController(deps.userRepository);
  const ticketController = new TicketController(
    deps.ticketRepository,
    deps.userRepository,
    deps.commentRepository,
    dispatcher,
  );
  const requireAuth = createAuthMiddleware(deps.userRepository);

  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());
  app.use(
    "/api",
    createRouter({ healthController, authController, userController, ticketController, requireAuth }),
  );

  app.use((_request, response) => {
    response.status(404).json({ message: "Rota nao encontrada" });
  });

  return app;
}
