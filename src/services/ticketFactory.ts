import type { Ticket, TicketPriority } from "../models/types";
import { generateId } from "../utils/generateId";

export interface CreateTicketInput {
	title: string;
	description: string;
	category: string;
	requesterId: string;
	assignedToId?: string;
}

interface CreateTicketEntityInput extends CreateTicketInput {
	priority: TicketPriority;
}

export function createTicketEntity(input: CreateTicketEntityInput): Ticket {
	const now = new Date().toISOString();

	return {
		id: generateId("ticket"),
		title: input.title,
		description: input.description,
		category: input.category,
		requesterId: input.requesterId,
		assignedToId: input.assignedToId,
		status: "open",
		priority: input.priority,
		createdAt: now,
		updatedAt: now,
	};
}
