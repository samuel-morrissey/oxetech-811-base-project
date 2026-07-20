import { Router } from "express";
import ticketRoutes from "./ticket-routes";
import userRoutes from "./user-routes";

const router = Router();

router.use(ticketRoutes);
router.use(userRoutes);

router.get("/health", (_request, response) => {
  response.json({ status: "ok", service: "oxetech-helpdesk" });
});

export default router;