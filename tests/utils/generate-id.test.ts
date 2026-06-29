import { describe, expect, it } from "vitest";
import { generateId } from "../../src/utils/generate-id.js";

describe("generateId", () => {
  it("gera id com prefixo informado", () => {
    const id = generateId("ticket");

    expect(id.startsWith("ticket_")).toBe(true);
  });

  it("gera ids diferentes em chamadas consecutivas", () => {
    const firstId = generateId("comment");
    const secondId = generateId("comment");

    expect(firstId).not.toBe(secondId);
  });
});
