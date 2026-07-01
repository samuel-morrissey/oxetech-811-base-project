import { Router } from "express";
import { dispatcher } from "../events/dispatcher";
import { HealthController } from "../controllers/HealthController";
import { TicketController } from "../controllers/TicketController";
import { UserController } from "../controllers/UserController";
import { JsonCommentRepository } from "../services/db/JsonCommentRepository";
import { JsonTicketRepository } from "../services/db/JsonTicketRepository";
import { JsonUserRepository } from "../services/db/JsonUserRepository";

const router = Router();

const userRepository = new JsonUserRepository();
const ticketRepository = new JsonTicketRepository();
const commentRepository = new JsonCommentRepository();

const healthController = new HealthController();
const userController = new UserController(userRepository);
const ticketController = new TicketController(ticketRepository, userRepository, commentRepository, dispatcher);

router.get("/health", healthController.check);

router.get("/users", userController.list);

router.get("/tickets", ticketController.list);
router.get("/tickets/summary", ticketController.summary);
router.get("/tickets/:id", ticketController.getById);
router.post("/tickets", ticketController.create);
router.patch("/tickets/:id/status", ticketController.updateStatus);
router.post("/tickets/:id/comments", ticketController.addComment);

export default router;
