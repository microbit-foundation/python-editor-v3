import { configDefaults, defineConfig, UserConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { loadEnv } from "vite";
import fs from "node:fs";
import path from "node:path";

// Support optionally pulling in external branding if the module is installed.
const theme = "@microbit-foundation/python-editor-v3-microbit";
const external = `node_modules/${theme}`;
const internal = "src/deployment/default";

export default defineConfig(({ mode }) => {
  const commonEnv = loadEnv(mode, process.cwd(), "");
  const unitTest: UserConfig["test"] = {
    globals: true,
    exclude: [...configDefaults.exclude, "**/e2e/**"],
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    mockReset: true,
  };
  const e2eTest: UserConfig["test"] = {
    globals: true,
    include: ["src/e2e/**/*.test.ts"],
    environment: "jsdom",
    testTimeout: 60_000,
    hookTimeout: 30_000,
  };
  const config: UserConfig = {
    base: process.env.BASE_URL ?? "/",
    build: {
      outDir: "build",
      sourcemap: true,
    },
    worker: {
      format: "es",
    },
    server: {
      port: 3000,
    },
    assetsInclude: ["**/*.hex"],
    plugins: [react(), svgr()],
    test: mode === "e2e" ? e2eTest : unitTest,
    resolve: {
      alias: {
        "theme-package": fs.existsSync(external)
          ? theme
          : path.resolve(__dirname, internal),
      },
    },
  };
  return config;
});
