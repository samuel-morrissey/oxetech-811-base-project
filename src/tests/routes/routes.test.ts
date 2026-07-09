import request from "supertest";
import { describe, expect, test } from "@jest/globals";
import app from "../../app";
import { DatabaseManager } from "../../repository";

describe("Health Route", () => {
    test("should return the API status", async () => {
        // Act
        const response = await request(app).get("/api/health");

        // Assert
        expect(response.body).toEqual({
            status: "ok",
            service: "oxetech-helpdesk",
        });
    });
});

describe("Get /Tickets Route", () => {
    test("should return all tickets", async () => {
        // Act
        const response = await request(app).get("/api/tickets");

        // Assert
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);

        // Check if each ticket has the required properties
        response.body.forEach((ticket: any) => {
            expect(ticket).toHaveProperty("id");
            expect(ticket).toHaveProperty("title");
            expect(ticket).toHaveProperty("description");
            expect(ticket).toHaveProperty("category");
            expect(ticket).toHaveProperty("status");
            expect(ticket).toHaveProperty("priority");
            expect(ticket).toHaveProperty("requesterId");
            expect(ticket).toHaveProperty("createdAt");
            expect(ticket).toHaveProperty("updatedAt");
        });

        // Check if each ticket has the requester and assigned user details
        response.body.forEach((ticket: any) => {
            expect(ticket).toHaveProperty("requester");
            expect(ticket.requester).toHaveProperty("id");
            expect(ticket.requester).toHaveProperty("name");
            expect(ticket.requester).toHaveProperty("email");
            expect(ticket.requester).toHaveProperty("role");

            if (ticket.assigned) {
                expect(ticket.assigned).toHaveProperty("id");
                expect(ticket.assigned).toHaveProperty("name");
                expect(ticket.assigned).toHaveProperty("email");
                expect(ticket.assigned).toHaveProperty("role");
            }
        });

        // Check if each ticket has the comments count
        response.body.forEach((ticket: any) => {
            expect(ticket).toHaveProperty("commentsCount");
            expect(typeof ticket.commentsCount).toBe("number");
        });

    });

});

describe("Get /tickets/summary Route", () => {
    test("should return the summary of tickets", async () => {
        // Act
        const response = await request(app).get("/api/tickets/summary");

        // Assert
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("open");
        expect(response.body).toHaveProperty("in_progress");
        expect(response.body).toHaveProperty("resolved");
        expect(response.body).toHaveProperty("closed");
        expect(response.body).toHaveProperty("urgent");

        expect(typeof response.body.open).toBe("number");
        expect(typeof response.body.in_progress).toBe("number");
        expect(typeof response.body.resolved).toBe("number");
        expect(typeof response.body.closed).toBe("number");
        expect(typeof response.body.urgent).toBe("number");

        expect(response.body.open).toBe(8);
        expect(response.body.in_progress).toBe(2);
        expect(response.body.resolved).toBe(1);
        expect(response.body.closed).toBe(0);
        expect(response.body.urgent).toBe(1);
    });

});

describe("Get /tickets/:id Route", () => {
    test("should return a ticket by ID with requester, assigned user and comments", async () => {
        // Act
        const response = await request(app).get("/api/tickets/ticket_1780329818375_109");

        // Assert
        // Check if the response status is 200 and the ticket has the required properties
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("id", "ticket_1780329818375_109");
        expect(response.body).toHaveProperty("title");
        expect(response.body).toHaveProperty("description");
        expect(response.body).toHaveProperty("category");
        expect(response.body).toHaveProperty("status");
        expect(response.body).toHaveProperty("priority");
        expect(response.body).toHaveProperty("requesterId");
        expect(response.body).toHaveProperty("createdAt");
        expect(response.body).toHaveProperty("updatedAt");

        // Check if the ticket has the expected values
        expect(response.body.id).toBe("ticket_1780329818375_109");
        expect(response.body.title).toBe("Nao consigo enviar atividade");
        expect(response.body.createdAt).toBe("2026-06-01T16:03:38.375Z");

        // Check if the ticket has the requester and assigned user details
        expect(response.body).toHaveProperty("requester");
        expect(response.body.requester).toHaveProperty("id");
        expect(response.body.requester).toHaveProperty("name");
        expect(response.body.requester).toHaveProperty("email");
        expect(response.body.requester).toHaveProperty("role");

        if (response.body.assigned) {
            expect(response.body.assigned).toHaveProperty("id");
            expect(response.body.assigned).toHaveProperty("name");
            expect(response.body.assigned).toHaveProperty("email");
            expect(response.body.assigned).toHaveProperty("role");
        }

        // Check if the ticket has the comments
        expect(response.body).toHaveProperty("comments");
        expect(Array.isArray(response.body.comments)).toBe(true);

        // Check if each comment has the required properties and the author details
        response.body.comments.forEach((comment: any) => {
            expect(comment).toHaveProperty("id");
            expect(comment).toHaveProperty("ticketId");
            expect(comment).toHaveProperty("authorId");
            expect(comment).toHaveProperty("content");

            expect(comment).toHaveProperty("author");
            expect(comment.author).toHaveProperty("id");
            expect(comment.author).toHaveProperty("name");
        });
    });

    test("should return 404 for a non-existing ticket ID", async () => {
        // Act
        const response = await request(app).get("/api/tickets/non_existing_ticket_id");

        // Assert
        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            error: "Ticket nao encontrado",
            id: "non_existing_ticket_id",
        });

    });
});

describe("post /tickets Route", () => {
    test("should create a new ticket", async () => {
        // Arrange
        const newTicket = {
            title: "Test Ticket",
            description: "This is a test ticket",
            category: "academico",
            requesterId: "user_ana",
        };

        // Act
        const response = await request(app).post("/api/tickets").send(newTicket);
        const database = DatabaseManager.getInstance().readDatabase();
        const createdTicket = database.tickets.find((ticket) => ticket.title === newTicket.title);

        // Assert

        // Check if the ticket was created in the database
        expect(createdTicket).toBeDefined();
        expect(createdTicket?.title).toBe(newTicket.title);
        expect(createdTicket?.description).toBe(newTicket.description);
        expect(createdTicket?.category).toBe(newTicket.category);
        expect(createdTicket?.requesterId).toBe(newTicket.requesterId);
        expect(createdTicket?.status).toBe("open");

        // Check if the response status is 201 and the ticket has the required properties
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("id");
        expect(response.body.title).toBe(newTicket.title);
        expect(response.body.description).toBe(newTicket.description);
        expect(response.body.category).toBe(newTicket.category);
        expect(response.body.requesterId).toBe(newTicket.requesterId);
        expect(response.body.status).toBe("open");

    });

    test("should return 400 for missing required field title", async () => {
        // Arrange
        const newTicket = {
            description: "This is a test ticket",
            category: "academico",
            requesterId: "user_ana",
        };

        // Act
        const response = await request(app).post("/api/tickets").send(newTicket);

        // Assert
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            message: "Campos obrigatorios ausentes",
            required: ["title", "description", "category", "requesterId"],
            received: newTicket,
        });
    });

    test("should return 400 for missing required field description", async () => {
        // Arrange
        const newTicket = {
            title: "Test Ticket",
            category: "academico",
            requesterId: "user_ana",
        };

        // Act
        const response = await request(app).post("/api/tickets").send(newTicket);

        // Assert
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            message: "Campos obrigatorios ausentes",
            required: ["title", "description", "category", "requesterId"],
            received: newTicket,
        });
    });

    test("should return 400 for missing required field category", async () => {
        // Arrange
        const newTicket = {
            title: "Test Ticket",
            description: "This is a test ticket",
            requesterId: "user_ana",
        };

        // Act
        const response = await request(app).post("/api/tickets").send(newTicket);

        // Assert
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            message: "Campos obrigatorios ausentes",
            required: ["title", "description", "category", "requesterId"],
            received: newTicket,
        });
    });

    test("should return 400 for missing required field requesterId", async () => {
        // Arrange
        const newTicket = {
            title: "Test Ticket",
            description: "This is a test ticket",
            category: "academico",
        };

        // Act
        const response = await request(app).post("/api/tickets").send(newTicket);

        // Assert
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            message: "Campos obrigatorios ausentes",
            required: ["title", "description", "category", "requesterId"],
            received: newTicket,
        });
    });

    test("should return 400 for invalid requesterId", async () => {
        // Arrange
        const newTicket = {
            title: "Test Ticket",
            description: "This is a test ticket",
            category: "academico",
            requesterId: "invalid_user_id",
        };

        // Act
        const response = await request(app).post("/api/tickets").send(newTicket);

        // Assert
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            message: "Solicitante invalido",
        });
    });
});

describe("patch /tickets/:id/status Route", () => {
    test("should update the status of a ticket", async () => {
        // Arrange
        const status = "in_progress";
        const authorId = "user_ana";
        const comment = "Starting to work on this ticket";
        const ticketId = "ticket_1780329818375_109";

        // Act
        const response = await request(app)
            .patch(`/api/tickets/${ticketId}/status`)
            .send({ status, authorId, comment });

        const database = DatabaseManager.getInstance().readDatabase();
        const updatedTicket = database.tickets.find((ticket) => ticket.id === ticketId);
        const createdComment = database.comments.find(
            (comment) =>
                comment.ticketId === ticketId &&
                comment.message === "Starting to work on this ticket"
        );

        // Assert
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("id", ticketId);
        expect(response.body).toHaveProperty("status", status);

        expect(createdComment).toBeDefined();
        expect(createdComment?.authorId).toBe("user_ana");

        expect(updatedTicket).toBeDefined();
        expect(updatedTicket?.status).toBe(status);

    });

    test("should return 404 for a non-existing ticket ID", async () => {
        // Arrange
        const status = "in_progress";
        const authorId = "user_ana";
        const comment = "Starting to work on this ticket";
        const ticketId = "non_existing_ticket_id";

        // Act
        const response = await request(app)
            .patch(`/api/tickets/${ticketId}/status`)
            .send({ status, authorId, comment });

        // Assert
        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            error: "Ticket nao encontrado",
        });
    });

    test("should return 400 for an invalid status", async () => {
        // Arrange
        const status = "invalid_status";
        const authorId = "user_ana";
        const comment = "Starting to work on this ticket";
        const ticketId = "ticket_1780329818375_109";

        // Act
        const response = await request(app)
            .patch(`/api/tickets/${ticketId}/status`)
            .send({ status, authorId, comment });

        // Assert
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            error: "Status invalido",
            allowed: ["open", "in_progress", "resolved", "closed"],
        });
    });

    test("should return 400 when closing a ticket without a comment", async () => {
        // Arrange
        const status = "closed";
        const authorId = "user_ana";
        const ticketId = "ticket_1780329818375_109";

        // Act
        const response = await request(app)
            .patch(`/api/tickets/${ticketId}/status`)
            .send({ status, authorId });

        // Assert
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            error: "Informe um comentario para fechar o chamado",
        });
    });
});

describe("post /tickets/:id/comments Route", () => {
    test("should create a new comment for a ticket", async () => {
        // Arrange
        const ticketId = "ticket_1780329818375_109";
        const newComment = {
            authorId: "user_ana",
            message: "This is a test comment",
        };

        // Act
        const response = await request(app)
            .post(`/api/tickets/${ticketId}/comments`)
            .send(newComment);

        const database = DatabaseManager.getInstance().readDatabase();
        const createdComment = database.comments.find(
            (comment) =>
                comment.ticketId === ticketId &&
                comment.message === newComment.message
        );

        // Assert
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("id");
        expect(response.body).toHaveProperty("ticketId", ticketId);
        expect(response.body).toHaveProperty("authorId", newComment.authorId);
        expect(response.body).toHaveProperty("message", newComment.message);

        // Check if the comment was created in the database
        expect(createdComment).toBeDefined();
        expect(createdComment?.ticketId).toBe(ticketId);
        expect(createdComment?.authorId).toBe(newComment.authorId);
        expect(createdComment?.message).toBe(newComment.message);

    });

    test("should return 404 for a non-existing ticket ID", async () => {
        // Arrange
        const ticketId = "non_existing_ticket_id";
        const newComment = {
            authorId: "user_ana",
            message: "This is a test comment",
        };

        // Act
        const response = await request(app)
            .post(`/api/tickets/${ticketId}/comments`)
            .send(newComment);

        // Assert
        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            error: "Ticket nao encontrado",
        });
    });

    test("should return 400 for missing authorId", async () => {
        // Arrange
        const ticketId = "ticket_1780329818375_109";
        const newComment = {
            message: "This is a test comment",
        };

        // Act
        const response = await request(app)
            .post(`/api/tickets/${ticketId}/comments`)
            .send(newComment);

        // Assert
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            error: "Comentario e autor sao obrigatorios",
        });
    });

    test("should return 400 for missing message", async () => {
        // Arrange
        const ticketId = "ticket_1780329818375_109";
        const newComment = {
            authorId: "user_ana",
        };

        // Act
        const response = await request(app)
            .post(`/api/tickets/${ticketId}/comments`)
            .send(newComment);

        // Assert
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            error: "Comentario e autor sao obrigatorios",
        });
    });
});





