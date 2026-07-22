import { describe, expect, it } from "vitest";

import { resolvePriority } from "../priorityRules";

describe("resolvePriority", () => {
  it("retorna urgent para categoria infra", () => {
    expect(resolvePriority({ category: "infra", description: "curta" })).toBe(
      "urgent",
    );
  });

  it("retorna urgent quando a descricao contem 'urgente' (case-insensitive)", () => {
    expect(
      resolvePriority({ category: "academico", description: "Isso e URGENTE" }),
    ).toBe("urgent");
  });

  it("retorna high para categoria sistemas", () => {
    expect(
      resolvePriority({ category: "sistemas", description: "curta" }),
    ).toBe("high");
  });

  it("retorna high quando a descricao ultrapassa o threshold", () => {
    expect(
      resolvePriority({ category: "academico", description: "a".repeat(221) }),
    ).toBe("high");
  });

  it("retorna medium para categoria academico sem outros gatilhos", () => {
    expect(
      resolvePriority({ category: "academico", description: "curta" }),
    ).toBe("medium");
  });

  it("retorna low como fallback para categoria desconhecida", () => {
    expect(resolvePriority({ category: "outro", description: "curta" })).toBe(
      "low",
    );
  });

  it("infra tem precedencia sobre sistemas na ordem de regras", () => {
    expect(resolvePriority({ category: "infra", description: "urgente" })).toBe(
      "urgent",
    );
  });
});
