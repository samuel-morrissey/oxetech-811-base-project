import { Router } from "express";
import { healthRouter } from "../features/health/health.routes.js";
import { ticketsRouter } from "../features/tickets/tickets.routes.js";
import { usersRouter } from "../features/users/users.routes.js";

const router = Router();

router.use("/health", healthRouter);
router.use("/users", usersRouter);
router.use("/tickets", ticketsRouter);

export { router };
