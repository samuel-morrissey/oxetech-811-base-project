import request from "supertest";
import app from "../src/app";

describe("GET /api/health", () => {

  test("deve retornar status da API", async () => {

    const response = await request(app)
      .get("/api/health");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      status: "ok",
      service: "oxetech-helpdesk"
    });

  });

});