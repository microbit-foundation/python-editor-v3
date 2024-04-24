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
      VitePWA({
        registerType: "autoUpdate",
        workbox: {
          // Ignore all language related assets and cache these at runtime instead.
          globIgnores: [
            "**/{pyright*.js,typeshed*.js,search.worker*.js,ui*.js}",
          ],
          maximumFileSizeToCacheInBytes: 3097152,
          globPatterns: ["**/*.{js,css,html,ico,png,svg,gif,hex}"],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/ajwvhvgo.apicdn.sanity.io\/.*/,
              handler: "CacheFirst",
              options: {
                cacheName: "sanity-content-cache",
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern:
                /^https:\/\/cdn.sanity.io\/images\/ajwvhvgo\/apps\/.*/,
              handler: "CacheFirst",
              options: {
                cacheName: "sanity-images-cache",
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
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
                  maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            // This doesn't work.
            // It doesn't work if you have runtime fetching of the simulator and it's js files either.
            // We cache everything in this case, but don't use the cache as the iframe is likely isolated.
            {
              urlPattern: /^https:\/\/python-simulator.usermbit.org\/.*/,
              handler: "CacheFirst",
              options: {
                cacheName: "sim-cache",
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /.*.js/,
              handler: "CacheFirst",
              options: {
                cacheName: "lang-cache",
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
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
