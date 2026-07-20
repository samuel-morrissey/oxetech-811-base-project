import fs from "node:fs";
import path from "node:path";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { CONFIG } from "../../constants";
import type { Database } from "../../types";
import { readDatabase, writeDatabase } from "../database";

vi.mock("node:fs", () => ({
  default: {
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
  },
}));

const mockedFs = vi.mocked(fs);

const expectedPath = path.resolve(
  process.cwd(),
  process.env.DATA_FILE || CONFIG.DEFAULT_DATA_FILE,
);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("readDatabase", () => {
  it("le o arquivo com o encoding configurado e faz parse do JSON", () => {
    const database: Database = { users: [], tickets: [], comments: [] };
    mockedFs.readFileSync.mockReturnValue(JSON.stringify(database));

    const result = readDatabase();

    expect(mockedFs.readFileSync).toHaveBeenCalledWith(
      expectedPath,
      CONFIG.FILE_ENCODING,
    );
    expect(result).toEqual(database);
  });

  it("propaga JSON invalido como erro de parse", () => {
    mockedFs.readFileSync.mockReturnValue("not json");
    expect(() => readDatabase()).toThrow(SyntaxError);
  });
});

describe("writeDatabase", () => {
  it("escreve o arquivo com JSON indentado", () => {
    const database: Database = {
      users: [
        {
          id: "u1",
          name: "Ana",
          email: "a@x",
          role: "student",
          password: "h",
        },
      ],
      tickets: [],
      comments: [],
    };

    writeDatabase(database);

    expect(mockedFs.writeFileSync).toHaveBeenCalledTimes(1);
    const [pathArg, contentArg] = mockedFs.writeFileSync.mock.calls[0] as [
      string,
      string,
    ];
    expect(pathArg).toBe(expectedPath);
    expect(JSON.parse(contentArg)).toEqual(database);
    expect(contentArg).toContain("\n  ");
  });
});
