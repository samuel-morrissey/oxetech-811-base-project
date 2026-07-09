import { Router } from "express";
import { TicketController } from "../controllers/TicketController";
import { validateCreateTicket } from "../middleware/validateCreateTicket";
import { patchTicketStatusMiddleware } from "../middleware/patchTicketStatus";

const router = Router();

router.get("/health", TicketController.getHealth);
router.get("/users", TicketController.getAllUsers);
router.get("/tickets", TicketController.getAllTickets);
router.get("/tickets/summary", TicketController.getSummary);
router.get("/tickets/:id", TicketController.getTicketById);
router.post("/tickets", validateCreateTicket, TicketController.postTicket);
router.patch("/tickets/:id/status", patchTicketStatusMiddleware, TicketController.patchTicketStatus);
router.post("/tickets/:id/comments", TicketController.postTicketComment);

export default router;