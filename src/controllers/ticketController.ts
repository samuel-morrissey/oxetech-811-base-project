import type { Request, Response } from "express";

import {
  ALLOWED_STATUSES,
  HTTP_STATUS,
  MESSAGES,
  QUERY_PARAMS,
  REQUIRED_TICKET_FIELDS,
  TICKET_PRIORITY,
  TICKET_STATUS,
} from "../constants";
import {
  parseAddTicketCommentInput,
  parseCreateTicketInput,
  parseUpdateTicketStatusInput,
} from "../dtos/parseTicketDtos";
import { readDatabase } from "../repositories/database";
import {
  addTicketComment,
  createTicket,
  getTicketById,
  listTickets,
  updateTicketStatus,
} from "../services/ticketService";

function queryParam(request: Request, key: string): string | undefined {
  const raw = request.query[key];
  return raw ? String(raw) : undefined;
}

export function list(request: Request, response: Response): void {
  const filters = {
    status: queryParam(request, QUERY_PARAMS.STATUS),
    category: queryParam(request, QUERY_PARAMS.CATEGORY),
    search: queryParam(request, QUERY_PARAMS.SEARCH),
  };

  response.json(listTickets(filters));
}

export function summary(_request: Request, response: Response): void {
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
}

export function getById(
  request: Request<{ id: string }>,
  response: Response,
): void {
  const ticket = getTicketById(request.params.id);

  if (!ticket) {
    response
      .status(HTTP_STATUS.NOT_FOUND)
      .json({ error: MESSAGES.TICKET_NOT_FOUND, id: request.params.id });
    return;
  }

  response.json(ticket);
}

export function create(request: Request, response: Response): void {
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
    response
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({ message: MESSAGES.INVALID_REQUESTER });
    return;
  }

  response.status(HTTP_STATUS.CREATED).json(result.ticket);
}

export function updateStatus(
  request: Request<{ id: string }>,
  response: Response,
): void {
  const parsed = parseUpdateTicketStatusInput(request.body);

  if (!parsed.success) {
    if (parsed.code === "invalid_status") {
      response.status(HTTP_STATUS.BAD_REQUEST).json({
        message: MESSAGES.INVALID_STATUS,
        allowed: ALLOWED_STATUSES,
      });
      return;
    }

    response
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({ message: MESSAGES.INVALID_STATUS });
    return;
  }

  const result = updateTicketStatus(request.params.id, parsed.data);

  if (!result.success) {
    if (result.error.code === "not_found") {
      response
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: MESSAGES.TICKET_NOT_FOUND });
      return;
    }

    response
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({ message: MESSAGES.COMMENT_REQUIRED_TO_CLOSE });
    return;
  }

  response.json(result.ticket);
}

export function addComment(
  request: Request<{ id: string }>,
  response: Response,
): void {
  const parsed = parseAddTicketCommentInput(request.body);

  if (!parsed.success) {
    response
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({ error: MESSAGES.COMMENT_AND_AUTHOR_REQUIRED });
    return;
  }

  const result = addTicketComment(request.params.id, parsed.data);

  if (!result.success) {
    response
      .status(HTTP_STATUS.NOT_FOUND)
      .json({ error: MESSAGES.TICKET_NOT_FOUND });
    return;
  }

  response.status(HTTP_STATUS.CREATED).json(result.comment);
}
