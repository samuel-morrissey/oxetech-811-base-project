import { describe, it, expect } from "vitest";
import {
  validateCreateTicket,
  validateUpdateStatus,
  validateCreateComment,
} from "../middlewares/validation.middleware";

describe("validation.middleware", () => {
  describe("validateCreateTicket", () => {
    it("retorna erro se campos obrigatórios estão ausentes", () => {
      const body = { title: "Dúvida" };
      const erro = validateCreateTicket(body);
      expect(erro).toContain("description");
    });

    it("retorna erro se categoria é inválida", () => {
      const body = {
        title: "Problema",
        description: "Não entra",
        category: "financeiro",
        requesterId: "user_ana",
      };
      const erro = validateCreateTicket(body);
      expect(erro).toContain("Categoria inválida");
    });

    it("retorna null para dados válidos", () => {
      const body = {
        title: "Problema",
        description: "Não entra",
        category: "sistemas",
        requesterId: "user_ana",
      };
      const erro = validateCreateTicket(body);
      expect(erro).toBeNull();
    });
  });

  describe("validateUpdateStatus", () => {
    it("retorna erro se status é inválido", () => {
      const erro = validateUpdateStatus({ status: "cancelado" });
      expect(erro).toContain("Status inválido");
    });

    it("retorna erro se fechar ticket sem comentário", () => {
      const erro = validateUpdateStatus({ status: "closed" });
      expect(erro).toContain("comentário");
    });

    it("retorna null se fechar ticket com comentário válido", () => {
      const erro = validateUpdateStatus({ status: "closed", comment: "Resolvido!" });
      expect(erro).toBeNull();
    });
  });

  describe("validateCreateComment", () => {
    it("retorna erro se mensagem ou autor estão vazios", () => {
      const erro = validateCreateComment({ message: "  " });
      expect(erro).toContain("Comentário é obrigatório");
    });

    it("retorna null se comentário é válido", () => {
      const erro = validateCreateComment({ message: "Olá", authorId: "user_ana" });
      expect(erro).toBeNull();
    });
  });
});
