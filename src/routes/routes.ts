import { Router } from "express";
import type { Ticket, TicketStatus } from "../types";
import { readDatabase, writeDatabase } from "../repositories/databaseRepository";
import {
	calculatePriority,
	VALID_STATUSES,
	findTicketById,
	createComment,
} from "../services/ticketService";
import { generateId } from "../utils/generateId";
import { toTicketDetailsDto, toTicketListItemDto } from "../dtos/ticketDto";
import { toPublicUserDto } from "../dtos/userDto";

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
	const database = readDatabase();
	const body = request.body;

	if (!body.title || !body.description || !body.category || !body.requesterId) {
		response.status(400).json({
			message: "Campos obrigatorios ausentes",
			required: ["title", "description", "category", "requesterId"],
			received: body,
		});
		return;
	}

	const user = database.users.find((user) => user.id === body.requesterId);
	if (!user) {
		response.status(400).json({ message: "Solicitante invalido" });
		return;
	}

	const now = new Date().toISOString();
	const ticket: Ticket = {
		id: generateId("ticket"),
		title: body.title,
		description: body.description,
		category: body.category,
		requesterId: body.requesterId,
		assignedToId: body.assignedToId,
		status: "open",
		priority: calculatePriority(body.category, body.description),
		createdAt: now,
		updatedAt: now,
	};

	database.tickets.push(ticket);
	writeDatabase(database);

	response.status(201).json(ticket);
});

router.patch("/tickets/:id/status", (request, response) => {
	const database = readDatabase();
	const ticket = findTicketById(database, request.params.id);
	const newStatus = request.body.status as TicketStatus;

	if (!ticket) {
		response.status(404).json({ message: "Ticket nao encontrado" });
		return;
	}

	if (!VALID_STATUSES.includes(newStatus)) {
		response
			.status(400)
			.json({ message: "Status invalido", allowed: VALID_STATUSES });
		return;
	}

	if (newStatus === "closed" && !request.body.comment) {
		response
			.status(400)
			.json({ message: "Informe um comentario para fechar o chamado" });
		return;
	}

	ticket.status = newStatus;
	ticket.updatedAt = new Date().toISOString();

	if (request.body.comment) {
		database.comments.push(
			createComment({
				ticketId: ticket.id,
				authorId: request.body.authorId || ticket.requesterId,
				message: request.body.comment,
			}),
		);
	}

	writeDatabase(database);
	response.json(ticket);
});

router.post("/tickets/:id/comments", (request, response) => {
	const database = readDatabase();
	const ticket = findTicketById(database, request.params.id);
	const body = request.body;

	if (!ticket) {
		response.status(404).json({ error: "Ticket nao encontrado" });
		return;
	}

	if (!body.message || !body.authorId) {
		response.status(400).json({ error: "Comentario e autor sao obrigatorios" });
		return;
	}

	const comment = createComment({
		ticketId: ticket.id,
		authorId: body.authorId,
		message: body.message,
	});

	database.comments.push(comment);
	ticket.updatedAt = new Date().toISOString();
	writeDatabase(database);

	response.status(201).json(comment);
});

export default router;
