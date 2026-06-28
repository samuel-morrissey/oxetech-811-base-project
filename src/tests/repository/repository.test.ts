import { describe, beforeAll, test, expect } from "@jest/globals";
import { DatabaseManager } from "../../repository";

describe("Repository Tests", () => {
    beforeAll(() => {
        // Set the environment variable for the test database file
        process.env.DATA_FILE = "src/tests/repository/db.test.json";
    });

    test("should read the database correctly", () => {
        // arrange

        // act
        const database = DatabaseManager.getInstance().readDatabase();
        const user = database.users.find(user => user.id === "user_carla");
        const ticket = database.tickets.find(ticket => ticket.id === "ticket_1782520173106_5542");
        const comment = database.comments.find(comment => comment.id === "comment_1780329818433_8565");

        // assert 
        expect(database).toHaveProperty("users");
        expect(database).toHaveProperty("tickets");
        expect(database).toHaveProperty("comments");

        expect(Array.isArray(database.users)).toBe(true);
        expect(Array.isArray(database.tickets)).toBe(true);
        expect(Array.isArray(database.comments)).toBe(true);

        expect(user!.id).toBe("user_carla");
        expect(user!.name).toBe("Carla Suporte");
        expect(user!.email).toBe("carla.suporte@example.com");

        expect(ticket!.id).toBe("ticket_1782520173106_5542");
        expect(ticket!.title).toBe("Nao consigo enviar atividade");
        expect(ticket!.description).toBe("O sistema apresenta erro ao anexar o arquivo da atividade.");

        expect(comment!.id).toBe("comment_1780329818433_8565");
        expect(comment!.ticketId).toBe("ticket_001");
        expect(comment!.authorId).toBe("user_carla");

    });
});







