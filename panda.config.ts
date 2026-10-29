/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { basePreset } from "@microbit/ui/base-preset";
import { densePreset } from "@microbit/ui/dense-preset";
import { defineConfig, Preset } from "@pandacss/dev";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { appPreset } from "./src/deployment/default/panda-preset";

// Optionally pull in the private brand preset, mirroring the `theme-package`
// alias swap in vite.config.ts. When the private package is installed it
// overrides brand tokens (colour ramps, code palette, semantic tokens);
// otherwise the OSS default preset stands alone. Panda merges them at codegen
// time.
//
// Panda bundles this config into a `data:` URL module, where a bare specifier
// has no base to resolve against, and a static import would fail the OSS build
// that lacks the package. So resolve it against the cwd (the app root, where
// the npm scripts run) and import it by absolute file URL.
const loadBrandPreset = async (): Promise<Preset | undefined> => {
  let resolved: string;
  try {
    resolved = createRequire(path.join(process.cwd(), "package.json")).resolve(
      "@microbit-foundation/python-editor-v3-microbit/panda-preset"
    );
  } catch {
    return undefined;
  }
  const mod = (await import(pathToFileURL(resolved).href)) as {
    default: Preset;
  };
  return mod.default;
};
const brandPreset = await loadBrandPreset();

export default defineConfig({
  preflight: true,
  jsxFramework: "react",
  // Later presets override earlier ones: @microbit/ui's base preset (the
  // complete design system + recipes, OSS default brand values), the shared
  // dense preset (this app's × 0.88 spacing / × 0.9 font-size density, shared
  // with classroom), this app's own preset, then the
  // optional private brand preset which overrides the OSS brand values.
  // staticCss lives in the base preset.
  presets: [
    "@pandacss/preset-base",
    basePreset,
    densePreset,
    appPreset,
    ...(brandPreset ? [brandPreset] : []),
  ],
  include: [
    "./src/**/*.{ts,tsx}",
    // @microbit/ui ships as source; include it so Panda extracts the styles its
    // components use. A glob that matches nothing fails silently (recipe styling
    // still works via the preset's staticCss), so a wrong path shows up only as
    // broken non-recipe styling — check the resolved node_modules path.
    "./node_modules/@microbit/ui/src/**/*.{ts,tsx}",
    "./node_modules/@microbit/ui-patterns/src/**/*.{ts,tsx}",
  ],
  outdir: "styled-system",
});
