import { z } from "zod";
import { VALID_STATUSES } from "../services/ticketService";

export const createTicketSchema = z.object({
	title: z.string().trim().min(1),
	description: z.string().trim().min(1),
	category: z.string().trim().min(1),
	requesterId: z.string().trim().min(1),
	assignedToId: z.string().trim().min(1).optional(),
});

export const updateTicketStatusSchema = z.object({
	status: z.enum(VALID_STATUSES),
	comment: z.string().trim().min(1).optional(),
	authorId: z.string().trim().min(1).optional(),
});

export const createCommentSchema = z.object({
	message: z.string().trim().min(1),
	authorId: z.string().trim().min(1),
});
