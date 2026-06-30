import type {
	Database,
	Ticket,
	TicketComment,
	TicketPriority,
	TicketStatus,
} from "../types";
import { readDatabase, writeDatabase } from "../repositories/databaseRepository";
import { generateId } from "../utils/generateId";

const HIGH_PRIORITY_MIN_LENGTH = 220;

interface PriorityRule {
    matches(fields: PriorityFields): boolean;
    readonly priority: TicketPriority;
}

interface PriorityFields {
    category: string;
    description: string;
}

class UrgentPriorityRule implements PriorityRule {
    readonly priority: TicketPriority = "urgent";

    matches(fields: PriorityFields): boolean {
        return (
            fields.category === "infra" ||
            fields.description.toLowerCase().includes("urgente")
        );
    }
}

class HighPriorityRule implements PriorityRule {
    readonly priority: TicketPriority = "high";

    matches(fields: PriorityFields): boolean {
        return fields.category === "sistemas" || fields.description.length > HIGH_PRIORITY_MIN_LENGTH;
    }
}

class MediumPriorityRule implements PriorityRule {
    readonly priority: TicketPriority = "medium";

    matches(fields: PriorityFields): boolean {
        return fields.category === "academico";
    }
}

const priorityRules: PriorityRule[] = [
    new UrgentPriorityRule(),
    new HighPriorityRule(),
    new MediumPriorityRule(),
];

export const VALID_STATUSES = ["open", "in_progress", "resolved", "closed"] as const;

export function calculatePriority(
    category: string,
    description: string,
): TicketPriority {
    const matchedRule = priorityRules.find((rule) =>
        rule.matches({ category, description }),
    );
    return matchedRule?.priority ?? "low";
}

export function findTicketById(database: Database, id: string): Ticket | undefined {
    return database.tickets.find((ticket: Ticket) => ticket.id === id);
}

interface CreateTicketInput {
	title: string;
	description: string;
	category: string;
	requesterId: string;
	assignedToId?: string;
}

type CreateTicketResult =
	| { success: true; ticket: Ticket }
	| { success: false; message: string };

export function createTicket(input: CreateTicketInput): CreateTicketResult {
	const database = readDatabase();
	const requester = database.users.find((user) => user.id === input.requesterId);

	if (!requester) {
		return { success: false, message: "Solicitante invalido" };
	}

	const now = new Date().toISOString();
	const ticket: Ticket = {
		id: generateId("ticket"),
		title: input.title,
		description: input.description,
		category: input.category,
		requesterId: input.requesterId,
		assignedToId: input.assignedToId,
		status: "open",
		priority: calculatePriority(input.category, input.description),
		createdAt: now,
		updatedAt: now,
	};

	database.tickets.push(ticket);
	writeDatabase(database);

	return { success: true, ticket };
}

interface CreateCommentInput {
	ticketId: string;
	authorId: string;
	message: string;
}

export function createComment(input: CreateCommentInput) {
	return {
		id: generateId("comment"),
		ticketId: input.ticketId,
		authorId: input.authorId,
		message: input.message,
		createdAt: new Date().toISOString(),
	};
}

interface UpdateTicketStatusInput {
	ticketId: string;
	status: TicketStatus;
	comment?: string;
	authorId?: string;
}

type UpdateTicketStatusResult =
	| { success: true; ticket: Ticket }
	| { success: false; statusCode: 400 | 404; message: string };

export function updateTicketStatus(
	input: UpdateTicketStatusInput,
): UpdateTicketStatusResult {
	const database = readDatabase();
	const ticket = findTicketById(database, input.ticketId);

	if (!ticket) {
		return { success: false, statusCode: 404, message: "Ticket nao encontrado" };
	}

	if (input.status === "closed" && !input.comment) {
		return {
			success: false,
			statusCode: 400,
			message: "Informe um comentario para fechar o chamado",
		};
	}

	ticket.status = input.status;
	ticket.updatedAt = new Date().toISOString();

	if (input.comment) {
		database.comments.push(
			createComment({
				ticketId: ticket.id,
				authorId: input.authorId || ticket.requesterId,
				message: input.comment,
			}),
		);
	}

	writeDatabase(database);

	return { success: true, ticket };
}

interface AddCommentToTicketInput {
	ticketId: string;
	authorId: string;
	message: string;
}

type AddCommentToTicketResult =
	| { success: true; comment: TicketComment }
	| { success: false; statusCode: 404; message: string };

export function addCommentToTicket(
	input: AddCommentToTicketInput,
): AddCommentToTicketResult {
	const database = readDatabase();
	const ticket = findTicketById(database, input.ticketId);

	if (!ticket) {
		return { success: false, statusCode: 404, message: "Ticket nao encontrado" };
	}

	const comment = createComment({
		ticketId: ticket.id,
		authorId: input.authorId,
		message: input.message,
	});

	database.comments.push(comment);
	ticket.updatedAt = new Date().toISOString();
	writeDatabase(database);

	return { success: true, comment };
}
