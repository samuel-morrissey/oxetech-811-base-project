import { Router, type Response } from "express";
import { helpdeskService, type FacadeResult } from "../services/helpdesk.service";
import {
  validateAddCommentBody,
  validateCreateTicketBody,
  validateListTicketsQuery,
  validateUpdateTicketStatusBody,
  type ValidationFailure,
} from "./helpdesk.validation";

const router = Router();

function sendFacadeResult<T>(response: Response, result: FacadeResult<T>) {
  if (!result.ok) {
    response.status(result.status).json(result.body);
    return;
  }

  response.status(result.status).json(result.data);
}

function sendValidationError(response: Response, result: ValidationFailure) {
  response.status(result.status).json(result.body);
}

router.get("/health", (_request, response) => {
  response.json({ status: "ok", service: "oxetech-helpdesk" });
});

router.get("/users", (_request, response) => {
  sendFacadeResult(response, helpdeskService.listUsers());
});

router.get("/tickets", (request, response) => {
  const validation = validateListTicketsQuery(request.query);
  if (!validation.ok) {
    sendValidationError(response, validation);
    return;
  }

  sendFacadeResult(response, helpdeskService.listTickets(validation.data));
});

router.get("/tickets/summary", (_request, response) => {
  sendFacadeResult(response, helpdeskService.getTicketsSummary());
});

router.get("/tickets/:id", (request, response) => {
  sendFacadeResult(response, helpdeskService.getTicketById(request.params.id));
});

router.post("/tickets", (request, response) => {
  const validation = validateCreateTicketBody(request.body);
  if (!validation.ok) {
    sendValidationError(response, validation);
    return;
  }

  sendFacadeResult(response, helpdeskService.createTicket(validation.data));
});

router.patch("/tickets/:id/status", (request, response) => {
  const validation = validateUpdateTicketStatusBody(request.body);
  if (!validation.ok) {
    sendValidationError(response, validation);
    return;
  }

  sendFacadeResult(
    response,
    helpdeskService.updateTicketStatus(request.params.id, validation.data),
  );
});

router.post("/tickets/:id/comments", (request, response) => {
  const validation = validateAddCommentBody(request.body);
  if (!validation.ok) {
    sendValidationError(response, validation);
    return;
  }

  sendFacadeResult(response, helpdeskService.addComment(request.params.id, validation.data));
});

export default router;
