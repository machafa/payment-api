import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import globals from "globals";

export default [
  {
    // Aplica estas regras a todos os ficheiros TypeScript
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        ...globals.node,
        ...globals.jest, // Isto resolve o erro do 'describe' e 'it'
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      // Podes adicionar ou remover regras aqui
      "no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off", // Como é uma API, o console.log é útil para logs iniciais
    },
  },
];