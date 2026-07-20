import { Router } from "express";

import * as healthController from "./controllers/healthController";
import * as ticketController from "./controllers/ticketController";
import * as userController from "./controllers/userController";

const router = Router();

router.get("/health", healthController.getHealth);

router.get("/users", userController.listUsers);

router.get("/tickets", ticketController.list);
router.get("/tickets/summary", ticketController.summary);
router.get("/tickets/:id", ticketController.getById);
router.post("/tickets", ticketController.create);
router.patch("/tickets/:id/status", ticketController.updateStatus);
router.post("/tickets/:id/comments", ticketController.addComment);

export default router;
