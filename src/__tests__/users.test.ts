import { describe, it, expect } from "vitest";
import { toPublicUser } from "../routes";
import type { User } from "../types";

const userComSenha: User = {
  id: "user_ana",
  name: "Ana Beatriz",
  email: "ana.aluna@example.com",
  role: "student",
  password: "123456",
};

describe("toPublicUser", () => {
  it("remove o campo password do objeto retornado", () => {
    const resultado = toPublicUser(userComSenha);
    expect(resultado).not.toHaveProperty("password");
  });

  it("preserva todos os outros campos sem alteração", () => {
    const resultado = toPublicUser(userComSenha);
    expect(resultado).toEqual({
      id: "user_ana",
      name: "Ana Beatriz",
      email: "ana.aluna@example.com",
      role: "student",
    });
  });
});
