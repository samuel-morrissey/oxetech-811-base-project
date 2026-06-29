import request from "supertest";
import { describe, expect, test } from "@jest/globals";
import app from "../../app";

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

