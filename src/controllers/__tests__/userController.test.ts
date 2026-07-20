import { beforeEach, describe, expect, it, vi } from "vitest";

import * as db from "../../repositories/database";
import type { Database } from "../../types";
import { listUsers } from "../userController";
import { makeReq, makeRes } from "./httpFakes";

vi.mock("../../repositories/database");

const mockedDb = vi.mocked(db);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("userController.listUsers", () => {
  it("retorna os usuarios do banco", () => {
    const database: Database = {
      users: [
        {
          id: "user_ana",
          name: "Ana",
          email: "ana@example.com",
          role: "student",
          password: "hash",
        },
      ],
      tickets: [],
      comments: [],
    };
    mockedDb.readDatabase.mockReturnValue(database);

    const { res, json } = makeRes();
    listUsers(makeReq(), res);

    expect(json).toHaveBeenCalledWith(database.users);
  });
});
