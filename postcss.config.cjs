/*
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 *
 * PostCSS runs because vite.config.ts keeps Vite's default CSS transformer
 * (not lightningcss, which would disable PostCSS).
 *
 * This app targets Safari/iOS 14 (see package.json "browserslist"), below the
 * 15.4 floor where Panda's output works natively, so two TEMPORARY downleveling
 * plugins run in PRODUCTION builds only (dev browsers are modern, and the
 * flattened @layer output makes devtools tracing painful). Drop both — and
 * raise the vite.config.ts build target — once support rises past those
 * browsers.
 *
 * 1. expandLogicalShorthands (@microbit/ui/postcss-legacy-safari) — Safari 14.x
 *    silently drops logical *shorthands* whose value contains var()
 *    (`padding-inline: var(--…)` applies nothing). Panda emits these for its
 *    px/py/mx/my utilities. Expands each into its logical -start/-end longhands
 *    (which work), so RTL still flips.
 * 2. @csstools/postcss-cascade-layers — Safari <15.4 drops @layer wholesale.
 *    A no-op during Chakra coexistence (the generated CSS is unlayered by
 *    ../ui/bin/unlayer-panda.mjs), but needed once layers return at the
 *    kill-switch.
 *
 * At the kill-switch, add `require("@pandacss/dev/postcss")()` as the FIRST
 * plugin (it replaces the `panda cssgen` step) and drop the cssgen/unlayer
 * wiring from package.json.
 */
const {
  expandLogicalShorthands,
} = require("@microbit/ui/postcss-legacy-safari");

module.exports = (ctx) => ({
  plugins:
    ctx.env === "production"
      ? [expandLogicalShorthands(), require("@csstools/postcss-cascade-layers")]
      : [],
});
