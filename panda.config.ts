/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { basePreset } from "@microbit/ui/base-preset";
import { densePreset } from "@microbit/ui/dense-preset";
import { defineConfig } from "@pandacss/dev";
import { appPreset } from "./src/deployment/default/panda-preset";

// Optionally pull in the private brand preset, mirroring the `theme-package`
// alias swap in vite.config.ts. When the private package is installed it
// overrides brand tokens (colour ramps, code palette, semantic tokens);
// otherwise the OSS default preset stands alone. Panda merges them at codegen
// time.
//
// Panda loads this config as CommonJS, so `require` is the real (sync) require;
// Node 24 resolves the ESM private package through it.
let brandPreset: unknown;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require("@microbit-foundation/python-editor-v3-microbit/panda-preset");
  brandPreset = (mod as { default: unknown }).default;
} catch {
  brandPreset = undefined;
}

export default defineConfig({
  preflight: true,
  jsxFramework: "react",
  // Drop Panda's default theme preset; the preset stack below supplies the full
  // token system. preset-base still provides the utilities.
  eject: true,
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
  ],
  outdir: "styled-system",
});
