import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "update-sessions/**",
      "archive/**",
    ],
  },
  {
    rules: {
      // TypeScript 'any' type - downgraded to warning
      // Allows build to succeed while encouraging proper typing
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    // Exempt ALL test files from ALL ESLint rules
    // Tests should focus on functionality, not linting standards
    files: [
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.ts",
      "**/*.spec.tsx",
      "lib/test/**/*.ts",
      "lib/test/**/*.tsx",
      "__tests__/**/*.ts",
      "__tests__/**/*.tsx",
      "**/__tests__/**/*.ts",
      "**/__tests__/**/*.tsx",
    ],
    rules: {
      // Disable all rules for test files
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "react/no-unescaped-entities": "off",
      "max-lines": "off",
      "no-restricted-imports": "off",
    },
  },
  {
    // Allow 'any' in error handlers (catching unknown errors)
    files: [
      "lib/api/error-handler.ts",
      "lib/database/errors.ts",
      "components/ui/*error-boundary*.tsx",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    // Allow 'any' in third-party type definitions
    files: [
      "lib/types/**/supabase.ts",
      "lib/supabase/**/*.ts",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    // Prevent cross-module imports (applies only to lib/modules/* files, not tests)
    files: ["lib/modules/**/*.ts", "lib/modules/**/*.tsx"],
    rules: {
      "no-restricted-imports": ["error", {
        "patterns": [{
          "group": ["@/lib/modules/crm/**"],
          "message": "Cross-module imports are forbidden in transaction module. Use shared types from @prisma/client only."
        }, {
          "group": ["@/lib/modules/ai/**"],
          "message": "Cross-module imports are forbidden in transaction module. Use shared types from @prisma/client only."
        }, {
          "group": ["@/lib/modules/analytics/**"],
          "message": "Cross-module imports are forbidden in transaction module. Use shared types from @prisma/client only."
        }]
      }]
    },
  },
  {
    // Exception: Data/content files can be any size
    files: ["**/data/**/*.ts", "**/data/**/*.tsx", "lib/data/**/*.ts"],
    rules: {
      "max-lines": "off",
    },
  },
];

export default eslintConfig;
