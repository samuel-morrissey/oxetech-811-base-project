import { describe, expect, it, beforeAll, beforeEach, afterAll } from "@jest/globals";
import fs from "node:fs";
import path from "node:path";
import request from "supertest";
import type { Express } from "express";
import type { Database } from "../../src/models/types";

const testDataFilePath = "tmp/integration-db.json";
const absoluteTestDataFilePath = path.resolve(process.cwd(), testDataFilePath);

function createTestDatabase(): Database {
	return {
		users: [
			{
				id: "user_ana",
				name: "Ana",
				email: "ana@example.com",
				role: "student",
				passwordHash: "hashed-secret",
			},
			{
				id: "user_carla",
				name: "Carla",
				email: "carla@example.com",
				role: "support",
				passwordHash: "hashed-secret",
			},
		],
		tickets: [
			{
				id: "ticket_1",
				title: "Erro no portal",
				description: "Nao consigo acessar",
				category: "sistemas",
				status: "open",
				priority: "high",
				requesterId: "user_ana",
				assignedToId: "user_carla",
				createdAt: "2026-06-01T00:00:00.000Z",
				updatedAt: "2026-06-01T00:00:00.000Z",
			},
		],
		comments: [],
	};
}

function writeTestDatabase(database = createTestDatabase()) {
	fs.mkdirSync(path.dirname(absoluteTestDataFilePath), { recursive: true });
	fs.writeFileSync(
		absoluteTestDataFilePath,
		JSON.stringify(database, null, 2),
	);
}

describe("API routes", () => {
	let app: Express;

	beforeAll(async () => {
		process.env.DATA_FILE = testDataFilePath;
		app = (await import("../../src/app")).default;
	});

	beforeEach(() => {
		writeTestDatabase();
	});

	afterAll(() => {
		if (fs.existsSync(absoluteTestDataFilePath)) {
			fs.unlinkSync(absoluteTestDataFilePath);
		}
	});

	it("returns health status", async () => {
		const response = await request(app).get("/api/health");

		expect(response.status).toBe(200);
		expect(response.body).toEqual({
			status: "ok",
			service: "oxetech-helpdesk",
		});
	});

	it("does not expose user password hashes", async () => {
		const response = await request(app).get("/api/users");

		expect(response.status).toBe(200);
		expect(response.body[0]).toEqual({
			id: "user_ana",
			name: "Ana",
			email: "ana@example.com",
			role: "student",
		});
		expect("passwordHash" in response.body[0]).toBe(false);
	});

	it("rejects invalid ticket creation body", async () => {
		const response = await request(app).post("/api/tickets").send({
			title: "",
			category: "infra",
			requesterId: "user_ana",
		});

		expect(response.status).toBe(400);
		expect(response.body.message).toBe("Dados invalidos");
		expect(response.body.errors.length).toBeGreaterThan(0);
	});

	it("creates a ticket with valid body", async () => {
		const response = await request(app).post("/api/tickets").send({
			title: "Rede lenta",
			description: "Internet lenta no laboratorio",
			category: "infra",
			requesterId: "user_ana",
			assignedToId: "user_carla",
		});

		expect(response.status).toBe(201);
		expect(response.body.status).toBe("open");
		expect(response.body.priority).toBe("urgent");

		const database = JSON.parse(
			fs.readFileSync(absoluteTestDataFilePath, "utf-8"),
		) as Database;
		expect(database.tickets).toHaveLength(2);
	});
});
