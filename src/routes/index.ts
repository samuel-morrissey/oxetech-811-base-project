import { Router } from "express";
import healthRouter from "./health.routes.js";
import ticketsRouter from "./tickets.routes.js";
import usersRouter from "./users.routes.js";

const router = Router();

router.use("/health", healthRouter);
router.use("/users", usersRouter);
router.use("/tickets", ticketsRouter);

export default router;
