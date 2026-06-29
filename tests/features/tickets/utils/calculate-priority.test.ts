import { describe, expect, it } from "vitest";
import { calculatePriority } from "../../../../src/features/tickets/utils/calculate-priority.js";

describe("calculatePriority", () => {
  it("retorna urgent para categoria infra", () => {
    expect(calculatePriority("infra", "descricao curta")).toBe(
      "urgent",
    );
  });

  it("retorna urgent quando descricao contem urgente", () => {
    expect(
      calculatePriority("outros", "Problema URGENTE no login"),
    ).toBe("urgent");
  });

  it("retorna high para categoria sistemas", () => {
    expect(calculatePriority("sistemas", "descricao curta")).toBe(
      "high",
    );
  });

  it("retorna high quando descricao tem mais de 220 caracteres", () => {
    expect(calculatePriority("outros", "a".repeat(221))).toBe("high");
  });

  it("retorna medium para categoria academico", () => {
    expect(calculatePriority("academico", "descricao curta")).toBe(
      "medium",
    );
  });

  it("retorna low para categoria desconhecida", () => {
    expect(calculatePriority("outros", "descricao curta")).toBe(
      "low",
    );
  });
});
