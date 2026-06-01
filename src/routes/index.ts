import { Router } from "express";
import { readDatabase } from "../database/jsonDatabase.js";
import type { Database } from "../types.js";
import ticketsRouter from "./tickets.routes.js";

const router = Router();

router.get("/health", (_request, response) => {
  response.json({ status: "ok", service: "oxetech-helpdesk" });
});

router.get("/users", (_request, response) => {
  const database: Database = readDatabase();

  response.json(database.users);
});

router.use("/tickets", ticketsRouter);

export default router;
