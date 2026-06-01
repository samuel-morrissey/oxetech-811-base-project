import { describe, expect, it } from "vitest";
import { calculatePriority } from "../../../../src/features/tickets/utils/calculate-priority.js";

describe("calculatePriority", () => {
  it("retorna urgent para categoria infra", () => {
    expect(calculatePriority("infra", "descricao curta")).toBe(
      "urgent",
    );
  });

  it("retorna low para categoria desconhecida", () => {
    expect(calculatePriority("outros", "descricao curta")).toBe(
      "low",
    );
  });
});
