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
      // File size limits
      "max-lines": ["error", {
        "max": 500,
        "skipBlankLines": true,
        "skipComments": true
      }],
      "max-lines-per-function": ["warn", {
        "max": 50,
        "skipBlankLines": true,
        "skipComments": true
      }],
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
    files: ["**/data/**/*.ts", "**/data/**/*.tsx"],
    rules: {
      "max-lines": "off",
    },
  },
];

export default eslintConfig;
