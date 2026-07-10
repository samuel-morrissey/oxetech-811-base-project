import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AppError } from "./errors";
import {
  validateAddCommentInput,
  validateCreateTicketInput,
  validateUpdateStatusInput,
} from "./validation";

describe("validateCreateTicketInput", () => {
  it("aceita payload valido e remove espacos extras", () => {
    const result = validateCreateTicketInput({
      title: "  Problema no login  ",
      description: "Nao consigo acessar o ambiente",
      category: "sistemas",
      requesterId: "user_ana",
    });

    assert.equal(result.title, "Problema no login");
    assert.equal(result.category, "sistemas");
    assert.equal(result.requesterId, "user_ana");
  });

  it("rejeita campos vazios", () => {
    assert.throws(
      () =>
        validateCreateTicketInput({
          title: "   ",
          description: "Descricao",
          category: "sistemas",
          requesterId: "user_ana",
        }),
      (error: unknown) => error instanceof AppError && error.statusCode === 400,
    );
  });

  it("rejeita categoria invalida", () => {
    assert.throws(
      () =>
        validateCreateTicketInput({
          title: "Titulo",
          description: "Descricao",
          category: "financeiro",
          requesterId: "user_ana",
        }),
      (error: unknown) =>
        error instanceof AppError &&
        error.statusCode === 400 &&
        error.message === "Categoria invalida",
    );
  });

  it("rejeita solicitante inexistente", () => {
    assert.throws(
      () =>
        validateCreateTicketInput({
          title: "Titulo",
          description: "Descricao",
          category: "sistemas",
          requesterId: "user_inexistente",
        }),
      (error: unknown) =>
        error instanceof AppError &&
        error.statusCode === 400 &&
        error.message === "Solicitante invalido",
    );
  });
});

describe("validateUpdateStatusInput", () => {
  it("aceita status valido", () => {
    const result = validateUpdateStatusInput({ status: "in_progress" });
    assert.equal(result.status, "in_progress");
  });

  it("rejeita status invalido", () => {
    assert.throws(
      () => validateUpdateStatusInput({ status: "invalido" }),
      (error: unknown) =>
        error instanceof AppError &&
        error.statusCode === 400 &&
        error.message === "Status invalido",
    );
  });

  it("exige comentario ao fechar chamado", () => {
    assert.throws(
      () => validateUpdateStatusInput({ status: "closed" }),
      (error: unknown) =>
        error instanceof AppError &&
        error.statusCode === 400 &&
        error.message === "Informe um comentario para fechar o chamado",
    );
  });

  it("aceita fechamento com comentario", () => {
    const result = validateUpdateStatusInput({
      status: "closed",
      comment: "Problema resolvido",
      authorId: "user_carla",
    });

    assert.equal(result.status, "closed");
    assert.equal(result.comment, "Problema resolvido");
  });
});

describe("validateAddCommentInput", () => {
  it("aceita comentario valido", () => {
    const result = validateAddCommentInput({
      authorId: "user_carla",
      message: "Em atendimento",
    });

    assert.equal(result.authorId, "user_carla");
    assert.equal(result.message, "Em atendimento");
  });

  it("rejeita autor inexistente", () => {
    assert.throws(
      () =>
        validateAddCommentInput({
          authorId: "user_fantasma",
          message: "Comentario",
        }),
      (error: unknown) =>
        error instanceof AppError &&
        error.statusCode === 400 &&
        error.message === "Autor invalido",
    );
  });
});
