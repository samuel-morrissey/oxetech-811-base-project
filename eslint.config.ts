import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

export default defineConfig(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-restricted-types": [
        "error",
        {
          types: {
            unknown: {
              message: "Use tipos especificos em vez de unknown.",
            },
            any: {
              message: "Use tipos especificos em vez de any.",
            },
          },
        },
      ],
    },
  },
  {
    ignores: ["dist/**", "node_modules/**", "data/**"],
  },
);
