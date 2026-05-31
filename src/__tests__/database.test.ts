import { describe, it, expect } from "vitest";
import { readDatabaseFromPath } from "../database";

const CAMINHO_INEXISTENTE = "/caminho/que/nao/existe/db.json";

describe("readDatabaseFromPath", () => {
  it("lança erro quando o arquivo não existe", () => {
    expect(() => readDatabaseFromPath(CAMINHO_INEXISTENTE)).toThrow();
  });

  it("inclui instrução para rodar npm run seed na mensagem de erro", () => {
    expect(() => readDatabaseFromPath(CAMINHO_INEXISTENTE)).toThrowError(
      'Execute "npm run seed"',
    );
  });
});
