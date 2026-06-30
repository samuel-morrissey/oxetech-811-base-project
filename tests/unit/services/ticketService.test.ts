import { describe, expect, it, jest } from "@jest/globals";
import type { Database } from "../../../src/models/types";
import {
	createTicketService,
	type TicketRepository,
} from "../../../src/services/ticketService";
import { calculatePriority } from "../../../src/services/ticketPriorityService";

function createDatabase(): Database {
	return {
		users: [
			{
				id: "user_1",
				name: "Ana",
				email: "ana@example.com",
				role: "student",
				passwordHash: "hashed-secret",
			},
			{
				id: "support_1",
				name: "Bruno",
				email: "bruno@example.com",
				role: "support",
				passwordHash: "hashed-secret",
			},
		],
		tickets: [
			{
				id: "ticket_1",
				title: "Problema no sistema",
				description: "Erro ao abrir o portal",
				category: "sistemas",
				status: "open",
				priority: "high",
				requesterId: "user_1",
				createdAt: "2026-06-01T00:00:00.000Z",
				updatedAt: "2026-06-01T00:00:00.000Z",
			},
		],
		comments: [],
	};
}

function createFakeTicketRepository(database = createDatabase()) {
	const repository: TicketRepository = {
		readDatabase: jest.fn(() => database),
		writeDatabase: jest.fn(),
	};

	return { database, repository };
}

describe("calculatePriority", () => {
	it("returns urgent for infra category", () => {
		expect(calculatePriority("infra", "Sem internet")).toBe("urgent");
	});

	it("returns urgent when description contains urgente", () => {
		expect(calculatePriority("outros", "Chamado urgente")).toBe("urgent");
	});

	it("returns high for sistemas category", () => {
		expect(calculatePriority("sistemas", "Erro no portal")).toBe("high");
	});

	it("returns medium for academico category", () => {
		expect(calculatePriority("academico", "Duvida sobre matricula")).toBe(
			"medium",
		);
	});

	it("returns low when no rule matches", () => {
		expect(calculatePriority("outros", "Solicitacao comum")).toBe("low");
	});
});

describe("createTicketService", () => {
	it("creates a ticket when requester exists", () => {
		const { database, repository } = createFakeTicketRepository();
		const ticketService = createTicketService(repository);

		const result = ticketService.createTicket({
			title: "Rede lenta",
			description: "Internet lenta no laboratorio",
			category: "infra",
			requesterId: "user_1",
			assignedToId: "support_1",
		});

		expect(result.success).toBe(true);
		if (!result.success) return;

		expect(result.ticket.id).toMatch(/^ticket_/);
		expect(result.ticket.status).toBe("open");
		expect(result.ticket.priority).toBe("urgent");
	});

	it("persists the created ticket", () => {
		const { database, repository } = createFakeTicketRepository();
		const ticketService = createTicketService(repository);

		const result = ticketService.createTicket({
			title: "Rede lenta",
			description: "Internet lenta no laboratorio",
			category: "infra",
			requesterId: "user_1",
		});

		expect(result.success).toBe(true);
		if (!result.success) return;

		expect(database.tickets).toContain(result.ticket);
		expect(repository.writeDatabase).toHaveBeenCalledWith(database);
	});

	it("does not create a ticket when requester does not exist", () => {
		const { repository } = createFakeTicketRepository();
		const ticketService = createTicketService(repository);

		const result = ticketService.createTicket({
			title: "Rede lenta",
			description: "Internet lenta no laboratorio",
			category: "infra",
			requesterId: "missing_user",
		});

		expect(result).toEqual({
			success: false,
			message: "Solicitante invalido",
		});
		expect(repository.writeDatabase).not.toHaveBeenCalled();
	});

	it("requires a comment when closing a ticket", () => {
		const { repository } = createFakeTicketRepository();
		const ticketService = createTicketService(repository);

		const result = ticketService.updateTicketStatus({
			ticketId: "ticket_1",
			status: "closed",
		});

		expect(result).toEqual({
			success: false,
			statusCode: 400,
			message: "Informe um comentario para fechar o chamado",
		});
		expect(repository.writeDatabase).not.toHaveBeenCalled();
	});

	it("adds a comment to an existing ticket", () => {
		const { database, repository } = createFakeTicketRepository();
		const ticketService = createTicketService(repository);

		const result = ticketService.addCommentToTicket({
			ticketId: "ticket_1",
			authorId: "support_1",
			message: "Chamado em analise",
		});

		expect(result.success).toBe(true);
		if (!result.success) return;

		expect(result.comment.id).toMatch(/^comment_/);
		expect(result.comment.ticketId).toBe("ticket_1");
	});

	it("persists the added comment", () => {
		const { database, repository } = createFakeTicketRepository();
		const ticketService = createTicketService(repository);

		const result = ticketService.addCommentToTicket({
			ticketId: "ticket_1",
			authorId: "support_1",
			message: "Chamado em analise",
		});

		expect(result.success).toBe(true);
		if (!result.success) return;

		expect(database.comments).toContain(result.comment);
		expect(repository.writeDatabase).toHaveBeenCalledWith(database);
	});
});
