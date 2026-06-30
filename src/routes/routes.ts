import { Router } from "express";
import type { Request } from "express";
import type { z } from "zod";
import type { TicketStatus } from "../models/types";
import {
	databaseRepository,
	readDatabase,
} from "../repositories/databaseRepository";
import {
	VALID_STATUSES,
	findTicketById,
	createTicketService,
} from "../services/ticketService";
import { toTicketDetailsDto, toTicketListItemDto } from "../dtos/ticketDto";
import { toPublicUserDto } from "../dtos/userDto";
import {
	createCommentSchema,
	createTicketSchema,
	updateTicketStatusSchema,
} from "../schemas/ticketSchemas";
import { validateBody } from "../middlewares/validateBody";

const router = Router();
const ticketService = createTicketService(databaseRepository);
type CreateTicketBody = z.infer<typeof createTicketSchema>;
type UpdateTicketStatusBody = z.infer<typeof updateTicketStatusSchema>;
type CreateCommentBody = z.infer<typeof createCommentSchema>;
type TicketIdRequest<TBody> = Request<{ id: string }, unknown, TBody>;


router.get("/health", (_request, response) => {
	response.json({ status: "ok", service: "oxetech-helpdesk" });
});

router.get("/users", (_request, response) => {
	const database = readDatabase();

	response.json(database.users.map(toPublicUserDto));
});

router.get("/tickets", (request, response) => {
	const database = readDatabase();
	let tickets = database.tickets;

	if (request.query.status) {
		tickets = tickets.filter(
			(ticket) => ticket.status === request.query.status,
		);
	}

	if (request.query.category) {
		tickets = tickets.filter(
			(ticket) => ticket.category === request.query.category,
		);
	}

	if (request.query.search) {
		const search = String(request.query.search).toLowerCase();
		tickets = tickets.filter(
			(ticket) =>
				ticket.title.toLowerCase().includes(search) ||
				ticket.description.toLowerCase().includes(search) ||
				ticket.category.toLowerCase().includes(search),
		);
	}

	const result = tickets.map((ticket) => toTicketListItemDto(ticket, database));

	response.json(result);
});

router.get("/tickets/summary", (_request, response) => {
	const database = readDatabase();
	const summary: Record<TicketStatus, number> & { urgent: number } = {
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

	response.json(summary);
});

router.get("/tickets/:id", (request, response) => {
	const database = readDatabase();
	const ticket = findTicketById(database, request.params.id);

	if (!ticket) {
		response
			.status(404)
			.json({ error: "Ticket nao encontrado", id: request.params.id });
		return;
	}

	response.json(toTicketDetailsDto(ticket, database));
});

router.post("/tickets", validateBody(createTicketSchema), (request, response) => {
	const body = request.body as CreateTicketBody;
	const result = ticketService.createTicket(body);

	if (!result.success) {
		response.status(400).json({ message: result.message });
		return;
	}

	response.status(201).json(result.ticket);
});

router.patch(
	"/tickets/:id/status",
	validateBody(updateTicketStatusSchema),
	(request, response) => {
		const typedRequest = request as TicketIdRequest<UpdateTicketStatusBody>;
		const body = typedRequest.body;
		const result = ticketService.updateTicketStatus({
			ticketId: typedRequest.params.id,
			status: body.status,
			comment: body.comment,
			authorId: body.authorId,
		});

		if (!result.success) {
			response.status(result.statusCode).json({ message: result.message });
			return;
		}

		response.json(result.ticket);
	},
);

router.post(
	"/tickets/:id/comments",
	validateBody(createCommentSchema),
	(request, response) => {
		const typedRequest = request as TicketIdRequest<CreateCommentBody>;
		const body = typedRequest.body;
		const result = ticketService.addCommentToTicket({
			ticketId: typedRequest.params.id,
			authorId: body.authorId,
			message: body.message,
		});

		if (!result.success) {
			response.status(result.statusCode).json({ error: result.message });
			return;
		}

		response.status(201).json(result.comment);
	},
);

export default router;
