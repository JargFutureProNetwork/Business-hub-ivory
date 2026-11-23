import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

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
    // Third-party libraries copied verbatim for the embedded tools.
    "public/tools/vendor/**",
    // The Feed Planner's original script, kept in its author's style (hub changes are marked).
    "public/tools/feed-planner/**",
  ]),
]);

export default eslintConfig;
