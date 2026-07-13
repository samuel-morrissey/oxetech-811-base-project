import type { TicketStatus } from "../types";

export type ValidationFailure = { ok: false; status: number; body: Record<string, unknown> };

export type ValidationResult<T> = { ok: true; data: T } | ValidationFailure;

export type CreateTicketInput = {
  title: string;
  description: string;
  category: string;
  requesterId: string;
  assignedToId?: string;
};

export type UpdateTicketStatusInput = {
  status: TicketStatus;
  comment?: string;
  authorId?: string;
};

export type AddCommentInput = {
  message: string;
  authorId: string;
};

export type ListTicketsInput = {
  status?: TicketStatus;
  category?: string;
  search?: string;
};

const ALLOWED_STATUSES: TicketStatus[] = ["open", "in_progress", "resolved", "closed"];

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isOptionalNonEmptyString(value: unknown): value is string | undefined {
  return value === undefined || isNonEmptyString(value);
}

function isValidStatus(status: unknown): status is TicketStatus {
  return typeof status === "string" && ALLOWED_STATUSES.includes(status as TicketStatus);
}

export function validateCreateTicketBody(body: unknown): ValidationResult<CreateTicketInput> {
  if (typeof body !== "object" || body === null) {
    return { ok: false, status: 400, body: { message: "Corpo da requisicao invalido" } };
  }

  const { title, description, category, requesterId, assignedToId } = body as Record<string, unknown>;

  const missing: string[] = [];
  if (!isNonEmptyString(title)) missing.push("title");
  if (!isNonEmptyString(description)) missing.push("description");
  if (!isNonEmptyString(category)) missing.push("category");
  if (!isNonEmptyString(requesterId)) missing.push("requesterId");

  if (missing.length > 0) {
    return {
      ok: false,
      status: 400,
      body: { message: "Campos obrigatorios ausentes ou invalidos", required: missing },
    };
  }

  if (!isOptionalNonEmptyString(assignedToId)) {
    return { ok: false, status: 400, body: { message: "assignedToId deve ser uma string" } };
  }

  return {
    ok: true,
    data: {
      title: title as string,
      description: description as string,
      category: category as string,
      requesterId: requesterId as string,
      assignedToId,
    },
  };
}

export function validateUpdateTicketStatusBody(body: unknown): ValidationResult<UpdateTicketStatusInput> {
  if (typeof body !== "object" || body === null) {
    return { ok: false, status: 400, body: { message: "Corpo da requisicao invalido" } };
  }

  const { status, comment, authorId } = body as Record<string, unknown>;

  if (!isValidStatus(status)) {
    return {
      ok: false,
      status: 400,
      body: { message: "Status invalido", allowed: ALLOWED_STATUSES },
    };
  }

  if (!isOptionalNonEmptyString(comment)) {
    return { ok: false, status: 400, body: { message: "comment deve ser uma string" } };
  }

  if (!isOptionalNonEmptyString(authorId)) {
    return { ok: false, status: 400, body: { message: "authorId deve ser uma string" } };
  }

  return { ok: true, data: { status, comment, authorId } };
}

export function validateAddCommentBody(body: unknown): ValidationResult<AddCommentInput> {
  if (typeof body !== "object" || body === null) {
    return { ok: false, status: 400, body: { error: "Corpo da requisicao invalido" } };
  }

  const { message, authorId } = body as Record<string, unknown>;

  if (!isNonEmptyString(message) || !isNonEmptyString(authorId)) {
    return { ok: false, status: 400, body: { error: "Comentario e autor sao obrigatorios" } };
  }

  return { ok: true, data: { message, authorId } };
}

export function validateListTicketsQuery(query: unknown): ValidationResult<ListTicketsInput> {
  const { status, category, search } = (query ?? {}) as Record<string, unknown>;

  if (status !== undefined && !isValidStatus(status)) {
    return {
      ok: false,
      status: 400,
      body: { message: "Status invalido para filtro", allowed: ALLOWED_STATUSES },
    };
  }

  if (!isOptionalNonEmptyString(category) || !isOptionalNonEmptyString(search)) {
    return { ok: false, status: 400, body: { message: "category e search devem ser strings" } };
  }

  return { ok: true, data: { status, category, search } };
}
