import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: [
        "src/server.ts",
        "src/app.ts",
        "src/seed.ts",
        "src/**/*.routes.ts",
        "src/**/*.controller.ts",
        "src/routes/**",
        "src/http/**",
        "src/config/**",
        "src/**/*.repository.ts",
        "src/**/*.service.ts",
        "src/utils/json-database.ts",
        "src/utils/database-type.ts",
        "src/domain/**",
      ],
      reporter: ["text", "text-summary", "html", "lcov"],
      thresholds: {
        lines: 70,
        statements: 70,
        branches: 70,
        functions: 70,
      },
    },
  },
});
