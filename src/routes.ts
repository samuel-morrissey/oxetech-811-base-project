import { Router } from "express";
import {
  ALLOWED_STATUSES,
  HTTP_STATUS,
  MESSAGES,
  QUERY_PARAMS,
  REQUIRED_TICKET_FIELDS,
  SERVICE,
  TICKET_PRIORITY,
  TICKET_STATUS,
} from "./constants";
import {
  parseAddTicketCommentInput,
  parseCreateTicketInput,
  parseUpdateTicketStatusInput,
} from "./dtos/parseTicketDtos";
import { readDatabase } from "./repositories/database";
import {
  addTicketComment,
  createTicket,
  getTicketById,
  listTickets,
  updateTicketStatus,
} from "./services/ticketService";

const router = Router();

router.get("/health", (_request, response) => {
  response.json({ status: SERVICE.HEALTH_OK, service: SERVICE.NAME });
});

router.get("/users", (_request, response) => {
  const database = readDatabase();

  response.json(database.users);
});

router.get("/tickets", (request, response) => {
  const filters = {
    status: request.query[QUERY_PARAMS.STATUS]
      ? String(request.query[QUERY_PARAMS.STATUS])
      : undefined,
    category: request.query[QUERY_PARAMS.CATEGORY]
      ? String(request.query[QUERY_PARAMS.CATEGORY])
      : undefined,
    search: request.query[QUERY_PARAMS.SEARCH]
      ? String(request.query[QUERY_PARAMS.SEARCH])
      : undefined,
  };

  response.json(listTickets(filters));
});

router.get("/tickets/summary", (_request, response) => {
  const database = readDatabase();
  const summary = {
    [TICKET_STATUS.OPEN]: 0,
    [TICKET_STATUS.IN_PROGRESS]: 0,
    [TICKET_STATUS.RESOLVED]: 0,
    [TICKET_STATUS.CLOSED]: 0,
    [TICKET_PRIORITY.URGENT]: 0,
  };

  for (const ticket of database.tickets) {
    if (ticket.status === TICKET_STATUS.OPEN) summary[TICKET_STATUS.OPEN]++;
    if (ticket.status === TICKET_STATUS.IN_PROGRESS) summary[TICKET_STATUS.IN_PROGRESS]++;
    if (ticket.status === TICKET_STATUS.RESOLVED) summary[TICKET_STATUS.RESOLVED]++;
    if (ticket.status === TICKET_STATUS.CLOSED) summary[TICKET_STATUS.CLOSED]++;
    if (ticket.priority === TICKET_PRIORITY.URGENT) summary[TICKET_PRIORITY.URGENT]++;
  }

  response.json(summary);
});

router.get("/tickets/:id", (request, response) => {
  const ticket = getTicketById(request.params.id);

  if (!ticket) {
    response
      .status(HTTP_STATUS.NOT_FOUND)
      .json({ error: MESSAGES.TICKET_NOT_FOUND, id: request.params.id });
    return;
  }

  response.json(ticket);
});

router.post("/tickets", (request, response) => {
  const parsed = parseCreateTicketInput(request.body);

  if (!parsed.success) {
    response.status(HTTP_STATUS.BAD_REQUEST).json({
      message: MESSAGES.MISSING_FIELDS,
      required: REQUIRED_TICKET_FIELDS,
      received: parsed.received,
    });
    return;
  }

  const result = createTicket(parsed.data);

  if (!result.success) {
    response.status(HTTP_STATUS.BAD_REQUEST).json({ message: MESSAGES.INVALID_REQUESTER });
    return;
  }

  response.status(HTTP_STATUS.CREATED).json(result.ticket);
});

router.patch("/tickets/:id/status", (request, response) => {
  const parsed = parseUpdateTicketStatusInput(request.body);

  if (!parsed.success) {
    if (parsed.code === "invalid_status") {
      response.status(HTTP_STATUS.BAD_REQUEST).json({
        message: MESSAGES.INVALID_STATUS,
        allowed: ALLOWED_STATUSES,
      });
      return;
    }

    response.status(HTTP_STATUS.BAD_REQUEST).json({ message: MESSAGES.INVALID_STATUS });
    return;
  }

  const result = updateTicketStatus(request.params.id, parsed.data);

  if (!result.success) {
    if (result.error.code === "not_found") {
      response.status(HTTP_STATUS.NOT_FOUND).json({ message: MESSAGES.TICKET_NOT_FOUND });
      return;
    }

    response
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({ message: MESSAGES.COMMENT_REQUIRED_TO_CLOSE });
    return;
  }

  response.json(result.ticket);
});

router.post("/tickets/:id/comments", (request, response) => {
  const parsed = parseAddTicketCommentInput(request.body);

  if (!parsed.success) {
    response.status(HTTP_STATUS.BAD_REQUEST).json({ error: MESSAGES.COMMENT_AND_AUTHOR_REQUIRED });
    return;
  }

  const result = addTicketComment(request.params.id, parsed.data);

  if (!result.success) {
    response.status(HTTP_STATUS.NOT_FOUND).json({ error: MESSAGES.TICKET_NOT_FOUND });
    return;
  }

  response.status(HTTP_STATUS.CREATED).json(result.comment);
});

export default router;
