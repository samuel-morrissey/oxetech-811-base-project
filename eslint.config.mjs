import js from "@eslint/js";
import tseslint from "typescript-eslint";

// Configuracao minima do ESLint (flat config) para um projeto TypeScript.
// Usa apenas as regras recomendadas - simples, ideal para aprender.
export default tseslint.config(
  { ignores: ["dist/", "node_modules/"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // Nao reclama de argumentos de funcao nao usados (ex.: assinaturas
      // exigidas por uma interface), apenas de variaveis nao usadas.
      "@typescript-eslint/no-unused-vars": ["error", { args: "none" }],
    },
  },
);
