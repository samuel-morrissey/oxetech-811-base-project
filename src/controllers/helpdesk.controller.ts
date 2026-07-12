import { Router, type Response } from "express";
import { helpdeskService, type FacadeResult } from "../services/helpdesk.service";

const router = Router();

function sendFacadeResult<T>(response: Response, result: FacadeResult<T>) {
  if (!result.ok) {
    response.status(result.status).json(result.body);
    return;
  }

  response.status(result.status).json(result.data);
}

router.get("/health", (_request, response) => {
  response.json({ status: "ok", service: "oxetech-helpdesk" });
});

router.get("/users", (_request, response) => {
  sendFacadeResult(response, helpdeskService.listUsers());
});

router.get("/tickets", (request, response) => {
  sendFacadeResult(response, helpdeskService.listTickets(request.query));
});

router.get("/tickets/summary", (_request, response) => {
  sendFacadeResult(response, helpdeskService.getTicketsSummary());
});

router.get("/tickets/:id", (request, response) => {
  sendFacadeResult(response, helpdeskService.getTicketById(request.params.id));
});

router.post("/tickets", (request, response) => {
  sendFacadeResult(response, helpdeskService.createTicket(request.body));
});

router.patch("/tickets/:id/status", (request, response) => {
  sendFacadeResult(
    response,
    helpdeskService.updateTicketStatus(request.params.id, request.body),
  );
});

router.post("/tickets/:id/comments", (request, response) => {
  sendFacadeResult(response, helpdeskService.addComment(request.params.id, request.body));
});

export default router;
