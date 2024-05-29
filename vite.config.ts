import { configDefaults, defineConfig, UserConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import {
  IndexHtmlTransformContext,
  IndexHtmlTransformResult,
  loadEnv,
  Plugin,
} from "vite";
import fs from "node:fs";
import path from "node:path";
import ejs from "ejs";

// Support optionally pulling in external branding if the module is installed.
const theme = "@microbit-foundation/python-editor-v3-microbit";
const external = `node_modules/${theme}`;
const internal = "src/deployment/default";

// There are third-party options but seems better to just depend on ejs.
const viteEjsPlugin = ({ data }: { data: ejs.Data }): Plugin => ({
  name: "ejs",
  transformIndexHtml: {
    order: "pre",
    handler: (
      html: string,
      _ctx: IndexHtmlTransformContext
    ): IndexHtmlTransformResult => ejs.render(html, data),
  },
});

export default defineConfig(({ mode }) => {
  const unitTest: UserConfig["test"] = {
    globals: true,
    exclude: [...configDefaults.exclude, "**/e2e/**"],
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    mockReset: true,
  };
  const config: UserConfig = {
    base: process.env.BASE_URL ?? "/",
    build: {
      outDir: "build",
      sourcemap: true,
    },
    server: {
      port: 3000,
    },
    assetsInclude: ["**/*.hex"],
    plugins: [
      viteEjsPlugin({
        data: loadEnv(mode, process.cwd(), "VITE_"),
      }),
      react(),
      svgr(),
    ],
    test: unitTest,
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
