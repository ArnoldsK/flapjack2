import path from "path";
import { fileURLToPath } from "url";
import js from "@eslint/js";
import globals from "globals";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.ts"],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    plugins: { "simple-import-sort": simpleImportSort },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
      parserOptions: {
        ecmaVersion: 2020,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { args: "all", argsIgnorePattern: "^_" },
      ],
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            ["^node:", "^@?\\w"],
            ["^@app/", "^@project-types/"],
            ["^\\.\\./", "^\\./"],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
      "no-restricted-syntax": [
        "error",
        {
          "selector": "TSPropertySignature[optional=true]",
          "message":
            "Optional properties (x?: y) are disallowed. Use 'x: y | undefined' and always define the property.",
        },
      ],
    },
  },
  eslintConfigPrettier,
]);
