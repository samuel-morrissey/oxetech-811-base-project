import type { TicketStatus } from "../types";

export interface CreateTicketInput {
  title: string;
  description: string;
  category: string;
  requesterId: string;
  assignedToId?: string;
}

export interface UpdateTicketStatusInput {
  status: TicketStatus;
  comment?: string;
  authorId?: string;
}

export interface AddTicketCommentInput {
  message: string;
  authorId: string;
}

export type ParseCreateTicketResult =
  | { success: true; data: CreateTicketInput }
  | { success: false; code: "missing_fields"; received: Record<string, unknown> };

export type ParseUpdateTicketStatusResult =
  | { success: true; data: UpdateTicketStatusInput }
  | { success: false; code: "missing_fields" | "invalid_status" };

export type ParseAddTicketCommentResult =
  | { success: true; data: AddTicketCommentInput }
  | { success: false; code: "missing_fields" };
