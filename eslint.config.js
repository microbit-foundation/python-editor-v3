import microbit from "@microbit/eslint-config/react";

export default [
  {
    ignores: [
      // Build scripts kept in plain JS.
      "deployment.cjs",
      "bin",
      "bootstrap-template.js",
      "playwright.config.ts",
      "reports",
    ],
  },
  ...microbit,
  {
    // Vendored fork of @codemirror/lint: left in upstream style to keep the
    // diff against upstream reviewable.
    files: ["src/editor/codemirror/lint/lint.ts"],
    rules: {
      "prefer-const": "off",
      "@typescript-eslint/no-unnecessary-type-assertion": "off",
    },
  },
  {
    // Debt to be reviewed: this repo was not previously linted with the
    // type-checked preset and has a backlog of violations.
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/require-await": "off",
      "react/display-name": "off",
      // Debt to be reviewed: React-compiler-era hooks rules with existing
      // violations too involved to fix as part of lint config unification.
      "react-hooks/immutability": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
];
