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
    // Vendored agent tooling, not project source. `npx impeccable install`
    // drops ~20 .mjs/.js files here; they linted as 151 warnings, which
    // buries the real signal on a codebase whose baseline is zero.
    ".claude/skills/**",
    ".agents/skills/**",
  ]),
]);

export default eslintConfig;
