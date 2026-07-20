import { calculatePriority } from "../src/utils/utils";

describe("calculatePriority", () => {
  test("deve retornar urgent para categoria infra", () => {
    const priority = calculatePriority(
      "infra" as any,
      "Computador não liga"
    );

    expect(priority).toBe("urgent");
  });

  test("deve retornar high quando descrição possui mais de 220 caracteres", () => {
    const description = "a".repeat(221);

    const priority = calculatePriority(
      "academico" as any,
      description
    );

    expect(priority).toBe("high");
  });
});