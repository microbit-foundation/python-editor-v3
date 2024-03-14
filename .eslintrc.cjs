module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    // We should switch to recommended-type-checked but there are many issues to review
    "plugin:@typescript-eslint/recommended",
    //"plugin:@typescript-eslint/recommended-type-checked",
    "plugin:react-hooks/recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
  ],
  ignorePatterns: [
    "dist",
    ".eslintrc.cjs",
    "deployment.cjs",
    "bin/**/*.js",
    "bootstrap-template.js",
    "playwright.config.ts",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: ["./tsconfig.json", "./tsconfig.node.json"],
    tsconfigRootDir: __dirname,
  },
  plugins: ["react-refresh"],
  settings: {
    react: {
      version: "18",
    },
  },
  rules: {
    // More trouble than it's worth
    "react/no-unescaped-entities": "off",
    // False positives from library imports from Chakra UI
    "@typescript-eslint/unbound-method": "off",
    "@typescript-eslint/no-misused-promises": [
      "error",
      {
        checksVoidReturn: false,
      },
    ],
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        args: "all",
        argsIgnorePattern: "^_",
        caughtErrors: "all",
        // Let's remove e from here
        caughtErrorsIgnorePattern: "^_|e",
        destructuredArrayIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        ignoreRestSiblings: true,
      },
    ],
    // Temporary, new rules on Vite migration that are widely flouted
    "@typescript-eslint/no-explicit-any": "off",
    "prefer-const": "off",
    "react/display-name": "off",
  },
};
