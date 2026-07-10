import { AppError } from "./errors";
import type { AddCommentInput, CreateTicketInput, UpdateStatusInput } from "./ticketService";
import { VALID_CATEGORIES, VALID_STATUSES, type TicketStatus } from "./types";
import { findUserById } from "./userRepository";

function requireNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new AppError(400, `Campo '${field}' e obrigatorio`);
  }

  return value.trim();
}

export function validateCreateTicketInput(body: unknown): CreateTicketInput {
  if (!body || typeof body !== "object") {
    throw new AppError(400, "Corpo da requisicao invalido");
  }

  const data = body as Record<string, unknown>;
  const title = requireNonEmptyString(data.title, "title");
  const description = requireNonEmptyString(data.description, "description");
  const category = requireNonEmptyString(data.category, "category");
  const requesterId = requireNonEmptyString(data.requesterId, "requesterId");

  if (!VALID_CATEGORIES.includes(category as (typeof VALID_CATEGORIES)[number])) {
    throw new AppError(400, "Categoria invalida", { allowed: VALID_CATEGORIES });
  }

  if (!findUserById(requesterId)) {
    throw new AppError(400, "Solicitante invalido");
  }

  let assignedToId: string | undefined;
  if (data.assignedToId !== undefined && data.assignedToId !== null && data.assignedToId !== "") {
    assignedToId = requireNonEmptyString(data.assignedToId, "assignedToId");
    if (!findUserById(assignedToId)) {
      throw new AppError(400, "Responsavel invalido");
    }
  }

  return {
    title,
    description,
    category,
    requesterId,
    assignedToId,
  };
}

export function validateUpdateStatusInput(body: unknown): UpdateStatusInput {
  if (!body || typeof body !== "object") {
    throw new AppError(400, "Corpo da requisicao invalido");
  }

  const data = body as Record<string, unknown>;
  const status = requireNonEmptyString(data.status, "status") as TicketStatus;

  if (!VALID_STATUSES.includes(status)) {
    throw new AppError(400, "Status invalido", { allowed: VALID_STATUSES });
  }

  let comment: string | undefined;
  if (data.comment !== undefined && data.comment !== null && data.comment !== "") {
    comment = requireNonEmptyString(data.comment, "comment");
  }

  if (status === "closed" && !comment) {
    throw new AppError(400, "Informe um comentario para fechar o chamado");
  }

  let authorId: string | undefined;
  if (data.authorId !== undefined && data.authorId !== null && data.authorId !== "") {
    authorId = requireNonEmptyString(data.authorId, "authorId");
    if (!findUserById(authorId)) {
      throw new AppError(400, "Autor invalido");
    }
  }

  return {
    status,
    authorId,
    comment,
  };
}

export function validateAddCommentInput(body: unknown): AddCommentInput {
  if (!body || typeof body !== "object") {
    throw new AppError(400, "Corpo da requisicao invalido");
  }

  const data = body as Record<string, unknown>;
  const message = requireNonEmptyString(data.message, "message");
  const authorId = requireNonEmptyString(data.authorId, "authorId");

  if (!findUserById(authorId)) {
    throw new AppError(400, "Autor invalido");
  }

  return {
    message,
    authorId,
  };
}
