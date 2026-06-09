import { Router } from "express";
import {
  addTicketComment,
  createTicket,
  getTicketById,
  getTicketSummary,
  healthCheck,
  listTickets,
  listUsers,
  updateTicketStatus,
} from "./controllers/ticket.controller";

const router = Router();

router.get("/health", healthCheck);
router.get("/users", listUsers);
router.get("/tickets", listTickets);
router.get("/tickets/summary", getTicketSummary);
router.get("/tickets/:id", getTicketById);
router.post("/tickets", createTicket);
router.patch("/tickets/:id/status", updateTicketStatus);
router.post("/tickets/:id/comments", addTicketComment);

export default router;
