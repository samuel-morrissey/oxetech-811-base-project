import { ALLOWED_STATUSES, REQUIRED_TICKET_FIELDS, TICKET_FIELDS } from "../constants";
import type { TicketStatus } from "../types";
import type {
  AddTicketCommentInput,
  CreateTicketInput,
  ParseAddTicketCommentResult,
  ParseCreateTicketResult,
  ParseUpdateTicketStatusResult,
  UpdateTicketStatusInput,
} from "./ticketDtos";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function parseCreateTicketInput(body: Record<string, unknown>): ParseCreateTicketResult {
  const hasMissingFields = REQUIRED_TICKET_FIELDS.some((field) => !isNonEmptyString(body[field]));

  if (hasMissingFields) {
    return { success: false, code: "missing_fields", received: body };
  }

  const assignedToId = body[TICKET_FIELDS.ASSIGNED_TO_ID];

  const input: CreateTicketInput = {
    title: body[TICKET_FIELDS.TITLE] as string,
    description: body[TICKET_FIELDS.DESCRIPTION] as string,
    category: body[TICKET_FIELDS.CATEGORY] as string,
    requesterId: body[TICKET_FIELDS.REQUESTER_ID] as string,
    assignedToId: isNonEmptyString(assignedToId) ? assignedToId : undefined,
  };

  return { success: true, data: input };
}

export function parseUpdateTicketStatusInput(
  body: Record<string, unknown>,
): ParseUpdateTicketStatusResult {
  const status = body[TICKET_FIELDS.STATUS];

  if (!isNonEmptyString(status)) {
    return { success: false, code: "missing_fields" };
  }

  if (!ALLOWED_STATUSES.includes(status as TicketStatus)) {
    return { success: false, code: "invalid_status" };
  }

  const comment = body[TICKET_FIELDS.COMMENT];
  const authorId = body[TICKET_FIELDS.AUTHOR_ID];

  const input: UpdateTicketStatusInput = {
    status: status as TicketStatus,
    comment: isNonEmptyString(comment) ? comment : undefined,
    authorId: isNonEmptyString(authorId) ? authorId : undefined,
  };

  return { success: true, data: input };
}

export function parseAddTicketCommentInput(
  body: Record<string, unknown>,
): ParseAddTicketCommentResult {
  const message = body[TICKET_FIELDS.MESSAGE];
  const authorId = body[TICKET_FIELDS.AUTHOR_ID];

  if (!isNonEmptyString(message) || !isNonEmptyString(authorId)) {
    return { success: false, code: "missing_fields" };
  }

  const input: AddTicketCommentInput = {
    message,
    authorId,
  };

  return { success: true, data: input };
}
