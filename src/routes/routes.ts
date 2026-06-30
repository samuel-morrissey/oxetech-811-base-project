import { Router } from "express";
import { readDatabase } from "../repositories/databaseRepository";
import {
	VALID_STATUSES,
	findTicketById,
	createTicket,
	updateTicketStatus,
	addCommentToTicket,
} from "../services/ticketService";
import { toTicketDetailsDto, toTicketListItemDto } from "../dtos/ticketDto";
import { toPublicUserDto } from "../dtos/userDto";
import {
	createCommentSchema,
	createTicketSchema,
	updateTicketStatusSchema,
} from "../schemas/ticketSchemas";

const router = Router();


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
	const summary = {
		open: 0,
		in_progress: 0,
		resolved: 0,
		closed: 0,
		urgent: 0,
	};

	for (const ticket of database.tickets) {
		if (ticket.status === "open") summary.open++;
		if (ticket.status === "in_progress") summary.in_progress++;
		if (ticket.status === "resolved") summary.resolved++;
		if (ticket.status === "closed") summary.closed++;
		if (ticket.priority === "urgent") summary.urgent++;
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

router.post("/tickets", (request, response) => {
	const parsedBody = createTicketSchema.safeParse(request.body);

	if (!parsedBody.success) {
		response.status(400).json({
			message: "Dados invalidos",
			errors: parsedBody.error.issues,
		});
		return;
	}

	const result = createTicket(parsedBody.data);

	if (!result.success) {
		response.status(400).json({ message: result.message });
		return;
	}

	response.status(201).json(result.ticket);
});

router.patch("/tickets/:id/status", (request, response) => {
	const parsedBody = updateTicketStatusSchema.safeParse(request.body);

	if (!parsedBody.success) {
		response.status(400).json({
			message: "Dados invalidos",
			allowed: VALID_STATUSES,
			errors: parsedBody.error.issues,
		});
		return;
	}

	const body = parsedBody.data;
	const result = updateTicketStatus({
		ticketId: request.params.id,
		status: body.status,
		comment: body.comment,
		authorId: body.authorId,
	});

	if (!result.success) {
		response.status(result.statusCode).json({ message: result.message });
		return;
	}

	response.json(result.ticket);
});

router.post("/tickets/:id/comments", (request, response) => {
	const parsedBody = createCommentSchema.safeParse(request.body);

	if (!parsedBody.success) {
		response.status(400).json({
			error: "Comentario e autor sao obrigatorios",
			errors: parsedBody.error.issues,
		});
		return;
	}

	const body = parsedBody.data;
	const result = addCommentToTicket({
		ticketId: request.params.id,
		authorId: body.authorId,
		message: body.message,
	});

	if (!result.success) {
		response.status(result.statusCode).json({ error: result.message });
		return;
	}

	response.status(201).json(result.comment);
});

export default router;
