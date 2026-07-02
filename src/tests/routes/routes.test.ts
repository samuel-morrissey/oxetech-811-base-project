import request from "supertest";
import { describe, expect, test, beforeAll } from "@jest/globals";
import app from "../../app";

describe("Health Route", () => {
    beforeAll(() => {
        // Set the environment variable for the test database file
        process.env.DATA_FILE = "src/tests/repository/db.test.json";
    });

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
    beforeAll(() => {
        // Set the environment variable for the test database file
        process.env.DATA_FILE = "src/tests/repository/db.test.json";
    });
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
    beforeAll(() => {
        // Set the environment variable for the test database file
        process.env.DATA_FILE = "src/tests/repository/db.test.json";
    });

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
