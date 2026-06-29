import { z } from "zod";
import { TICKET_STATUSES } from "../types/ticket-status.js";

export const updateTicketStatusBodySchema = z.object({
  status: z.enum(TICKET_STATUSES),
  comment: z.string().trim().max(2000).optional(),
  authorId: z.string().min(1).optional(),
});

export type UpdateTicketStatusBody = z.infer<
  typeof updateTicketStatusBodySchema
>;

export interface UpdateTicketStatusDto extends UpdateTicketStatusBody {
  ticketId: string;
}
