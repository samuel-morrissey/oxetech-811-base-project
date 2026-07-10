import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculatePriority } from "./ticketService";

describe("calculatePriority", () => {
  it("retorna urgent para categoria infra", () => {
    assert.equal(calculatePriority("infra", "Projetor sem imagem"), "urgent");
  });

  it("retorna urgent quando a descricao menciona urgente", () => {
    assert.equal(calculatePriority("academico", "Preciso de ajuda urgente com a entrega"), "urgent");
  });

  it("retorna high para categoria sistemas", () => {
    assert.equal(calculatePriority("sistemas", "Erro no login"), "high");
  });

  it("retorna high para descricao longa", () => {
    const longDescription = "a".repeat(221);
    assert.equal(calculatePriority("outros", longDescription), "high");
  });

  it("retorna medium para categoria academico", () => {
    assert.equal(calculatePriority("academico", "Duvida sobre prazo"), "medium");
  });

  it("retorna low para demais casos", () => {
    assert.equal(calculatePriority("outros", "Pergunta simples"), "low");
  });
});
