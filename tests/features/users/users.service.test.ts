import { describe, expect, it } from "vitest";
import { UsersService } from "../../../src/features/users/users.service.js";
import type { User } from "../../../src/features/users/types/user.js";

describe("UsersService", () => {
  it("nao expoe password ao listar usuarios", () => {
    const users: User[] = [
      {
        id: "user_ana",
        name: "Ana Beatriz",
        email: "ana.aluna@example.com",
        role: "student",
        password: "123456",
      },
    ];

    const repository = {
      findAll: () => users,
      findById: () => undefined,
    };

    const service = new UsersService(repository);
    const result = service.list();

    expect(result).toHaveLength(1);
    expect(result[0]).not.toHaveProperty("password");
    expect(result[0]).toEqual({
      id: "user_ana",
      name: "Ana Beatriz",
      email: "ana.aluna@example.com",
      role: "student",
    });
  });
});
