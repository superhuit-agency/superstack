// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

import superstack from "./eslint-rules/uses-base-uri.mjs";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  ...storybook.configs["flat/recommended"],
  {
    files: ["src/components/{core,custom}/**/data.{ts,tsx}"],
    plugins: { superstack },
    rules: {
      "superstack/require-uses-base-uri": "error",
      "superstack/no-unused-uses-base-uri": "warn",
    },
  },
]);

export default eslintConfig;
