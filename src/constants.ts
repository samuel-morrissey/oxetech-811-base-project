import type { TicketPriority, TicketStatus } from "./types";

export const CONFIG = {
  DEFAULT_DATA_FILE: "data/db.json",
  FILE_ENCODING: "utf-8",
  JSON_INDENT: 2,
} as const;

export const ID = {
  RANDOM_MAX: 10_000,
  PREFIX: {
    TICKET: "ticket",
    COMMENT: "comment",
  },
} as const;

export const TICKET_CATEGORY = {
  INFRA: "infra",
  SISTEMAS: "sistemas",
  ACADEMICO: "academico",
} as const;

export const TICKET_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
} as const satisfies Record<string, TicketPriority>;

export const TICKET_STATUS = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
  CLOSED: "closed",
} as const satisfies Record<string, TicketStatus>;

export const ALLOWED_STATUSES: readonly TicketStatus[] = [
  TICKET_STATUS.OPEN,
  TICKET_STATUS.IN_PROGRESS,
  TICKET_STATUS.RESOLVED,
  TICKET_STATUS.CLOSED,
];

export const PRIORITY_RULES = {
  URGENT_KEYWORD: "urgente",
  LONG_DESCRIPTION_THRESHOLD: 220,
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
} as const;

export const SERVICE = {
  NAME: "oxetech-helpdesk",
  HEALTH_OK: "ok",
} as const;

export const QUERY_PARAMS = {
  STATUS: "status",
  CATEGORY: "category",
  SEARCH: "search",
} as const;

export const TICKET_FIELDS = {
  TITLE: "title",
  DESCRIPTION: "description",
  CATEGORY: "category",
  REQUESTER_ID: "requesterId",
  ASSIGNED_TO_ID: "assignedToId",
  STATUS: "status",
  COMMENT: "comment",
  AUTHOR_ID: "authorId",
  MESSAGE: "message",
} as const;

export const REQUIRED_TICKET_FIELDS = [
  TICKET_FIELDS.TITLE,
  TICKET_FIELDS.DESCRIPTION,
  TICKET_FIELDS.CATEGORY,
  TICKET_FIELDS.REQUESTER_ID,
] as const;

export const MESSAGES = {
  TICKET_NOT_FOUND: "Ticket nao encontrado",
  INVALID_REQUESTER: "Solicitante invalido",
  MISSING_FIELDS: "Campos obrigatorios ausentes",
  INVALID_STATUS: "Status invalido",
  COMMENT_REQUIRED_TO_CLOSE: "Informe um comentario para fechar o chamado",
  COMMENT_AND_AUTHOR_REQUIRED: "Comentario e autor sao obrigatorios",
} as const;
