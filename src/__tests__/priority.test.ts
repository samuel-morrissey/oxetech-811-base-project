import { describe, it, expect } from "vitest";
import { calculatePriority } from "../services/TicketService";

describe("calculatePriority", () => {
  it('retorna "urgent" para categoria infra', () => {
    expect(calculatePriority("infra", "Problema no servidor")).toBe("urgent");
  });

  it('retorna "urgent" quando a descrição contém a palavra "urgente"', () => {
    expect(calculatePriority("academico", "Preciso de ajuda urgente")).toBe("urgent");
  });

  it('retorna "urgent" independente do case da palavra "urgente"', () => {
    expect(calculatePriority("academico", "URGENTE: sistema fora")).toBe("urgent");
  });

  it('retorna "high" para categoria sistemas', () => {
    expect(calculatePriority("sistemas", "Erro ao fazer login")).toBe("high");
  });

  it('retorna "high" quando a descrição tem mais de 220 caracteres', () => {
    const descricaoLonga = "a".repeat(221);
    expect(calculatePriority("academico", descricaoLonga)).toBe("high");
  });

  it('retorna "medium" para categoria academico com descrição curta', () => {
    expect(calculatePriority("academico", "Dúvida sobre prazo")).toBe("medium");
  });

  it('não eleva prioridade para "high" quando a descrição tem exatamente 220 caracteres', () => {
    const descricaoNoLimiar = "a".repeat(220);
    expect(calculatePriority("academico", descricaoNoLimiar)).toBe("medium");
  });
});
