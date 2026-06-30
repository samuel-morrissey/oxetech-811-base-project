import type {
	Database,
	Ticket,
	TicketComment,
	TicketStatus,
} from "../models/types";
import {
	toTicketDetailsDto,
	toTicketListItemDto,
	type TicketDetailsDto,
	type TicketListItemDto,
} from "../dtos/ticketDto";
import { generateId } from "../utils/generateId";
import { createTicketEntity, type CreateTicketInput } from "./ticketFactory";
import { calculatePriority } from "./ticketPriorityService";

export const VALID_STATUSES = ["open", "in_progress", "resolved", "closed"] as const;

export function findTicketById(database: Database, id: string): Ticket | undefined {
    return database.tickets.find((ticket: Ticket) => ticket.id === id);
}

type CreateTicketResult =
	| { success: true; ticket: Ticket }
	| { success: false; message: string };

interface ListTicketsFilters {
	status?: string;
	category?: string;
	search?: string;
}

type TicketSummary = Record<TicketStatus, number> & { urgent: number };

type GetTicketDetailsResult =
	| { success: true; ticket: TicketDetailsDto }
	| { success: false; statusCode: 404; message: string };

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

interface AddCommentToTicketInput {
	ticketId: string;
	authorId: string;
	message: string;
}

type AddCommentToTicketResult =
	| { success: true; comment: TicketComment }
	| { success: false; statusCode: 404; message: string };

export interface TicketRepository {
	readDatabase(): Database;
	writeDatabase(database: Database): void;
}

export function createTicketService(repository: TicketRepository) {
	function listTickets(filters: ListTicketsFilters): TicketListItemDto[] {
		const database = repository.readDatabase();
		let tickets = database.tickets;

		if (filters.status) {
			tickets = tickets.filter((ticket) => ticket.status === filters.status);
		}

		if (filters.category) {
			tickets = tickets.filter((ticket) => ticket.category === filters.category);
		}

		if (filters.search) {
			const search = filters.search.toLowerCase();
			tickets = tickets.filter(
				(ticket) =>
					ticket.title.toLowerCase().includes(search) ||
					ticket.description.toLowerCase().includes(search) ||
					ticket.category.toLowerCase().includes(search),
			);
		}

		return tickets.map((ticket) => toTicketListItemDto(ticket, database));
	}

	function getTicketSummary(): TicketSummary {
		const database = repository.readDatabase();
		const summary: TicketSummary = {
			open: 0,
			in_progress: 0,
			resolved: 0,
			closed: 0,
			urgent: 0,
		};

		for (const ticket of database.tickets) {
			summary[ticket.status]++;

			if (ticket.priority === "urgent") {
				summary.urgent++;
			}
		}

		return summary;
	}

	function getTicketDetails(ticketId: string): GetTicketDetailsResult {
		const database = repository.readDatabase();
		const ticket = findTicketById(database, ticketId);

		if (!ticket) {
			return {
				success: false,
				statusCode: 404,
				message: "Ticket nao encontrado",
			};
		}

		return { success: true, ticket: toTicketDetailsDto(ticket, database) };
	}

	function createTicket(input: CreateTicketInput): CreateTicketResult {
		const database = repository.readDatabase();
		const requester = database.users.find(
			(user) => user.id === input.requesterId,
		);

		if (!requester) {
			return { success: false, message: "Solicitante invalido" };
		}

		const ticket = createTicketEntity({
			...input,
			priority: calculatePriority(input.category, input.description),
		});

		database.tickets.push(ticket);
		repository.writeDatabase(database);

		return { success: true, ticket };
	}

	function updateTicketStatus(
		input: UpdateTicketStatusInput,
	): UpdateTicketStatusResult {
		const database = repository.readDatabase();
		const ticket = findTicketById(database, input.ticketId);

		if (!ticket) {
			return {
				success: false,
				statusCode: 404,
				message: "Ticket nao encontrado",
			};
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

		repository.writeDatabase(database);

		return { success: true, ticket };
	}

	function addCommentToTicket(
		input: AddCommentToTicketInput,
	): AddCommentToTicketResult {
		const database = repository.readDatabase();
		const ticket = findTicketById(database, input.ticketId);

		if (!ticket) {
			return {
				success: false,
				statusCode: 404,
				message: "Ticket nao encontrado",
			};
		}

		const comment = createComment({
			ticketId: ticket.id,
			authorId: input.authorId,
			message: input.message,
		});

		database.comments.push(comment);
		ticket.updatedAt = new Date().toISOString();
		repository.writeDatabase(database);

		return { success: true, comment };
	}

	return {
		listTickets,
		getTicketSummary,
		getTicketDetails,
		createTicket,
		updateTicketStatus,
		addCommentToTicket,
	};
}
