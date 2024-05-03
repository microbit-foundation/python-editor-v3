import react from "@vitejs/plugin-react";
import ejs from "ejs";
import fs from "node:fs";
import path from "node:path";
import {
  IndexHtmlTransformContext,
  IndexHtmlTransformResult,
  loadEnv,
  Plugin,
} from "vite";
import { VitePWA } from "vite-plugin-pwa";
import svgr from "vite-plugin-svgr";
import { configDefaults, defineConfig, UserConfig } from "vitest/config";

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

// Removes webmanifest link tag from output index.html file.
// We add this tag if PWA features are enabled via a feature flag.
const viteRemoveManifestPlugin = (): Plugin => ({
  name: "Manifest",
  enforce: "post",
  transformIndexHtml: {
    order: "post",
    handler: (
      html: string,
      _ctx: IndexHtmlTransformContext
    ): IndexHtmlTransformResult => {
      return html.replace(
        `<link rel="manifest" href="${
          process.env.BASE_URL ?? "/"
        }manifest.webmanifest">`,
        ""
      );
    },
  },
});

export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
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
      VitePWA({
        disable: process.env.DISABLE_PWA === "1",
        registerType: "autoUpdate",
        workbox: {
          // Only precache language assets for the fallback language.
          // Cache other languages at runtime.
          // Cache all pyright-locale files as we can't tell what language they are.
          globIgnores: [
            "**/{typeshed.!(en*).js,pyright-locale-!(en*).js,search.worker.!(en*).js,ui.!(en*).js}",
          ],
          maximumFileSizeToCacheInBytes: 3097152,
          globPatterns: ["**/*.{js,css,html,ico,png,svg,gif,hex}"],
          runtimeCaching: [
            {
              urlPattern: new RegExp(
                `^https://${process.env.VITE_SANITY_PROJECT}.apicdn.sanity.io/.*`
              ),
              handler: "NetworkFirst",
              options: {
                cacheName: "sanity-content-cache",
                expiration: {
                  maxEntries: 40,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: new RegExp(
                `^https://cdn.sanity.io/images/${process.env.VITE_SANITY_PROJECT}/${process.env.VITE_SANITY_DATASET}/.*`
              ),
              handler: "CacheFirst",
              options: {
                cacheName: "sanity-images-cache",
                expiration: {
                  maxEntries: 100,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts.microbit.org\/.*/,
              handler: "CacheFirst",
              options: {
                cacheName: "fonts-cache",
                expiration: {
                  maxEntries: 10,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern:
                /.*(?:pyright-locale|search\.worker|typeshed|ui\.).*\.js/,
              handler: "CacheFirst",
              options: {
                cacheName: "lang-cache",
                expiration: {
                  maxEntries: 40,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        manifest: {
          name: "micro:bit Python Editor",
          short_name: "micro:bit Python Editor",
          description:
            "A Python Editor for the BBC micro:bit, built by the Micro:bit Educational Foundation and the global Python Community.",
          theme_color: "#6c4bc1",
          icons: [
            {
              src: `${process.env.BASE_URL ?? "/"}logo512.png`,
              sizes: "512x512",
              type: "image/png",
            },
            {
              src: `${process.env.BASE_URL ?? "/"}logo192.png`,
              sizes: "192x192",
              type: "image/png",
            },
          ],
        },
      }),
      viteRemoveManifestPlugin(),
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
