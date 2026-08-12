/*
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 *
 * PostCSS runs because vite.config.ts keeps Vite's default CSS transformer
 * (not lightningcss, which would disable PostCSS).
 *
 * This app targets Safari 14.1 / iOS 14.5 (BUILD_TARGETS in vite.config.ts),
 * below the 15.4 floor where Panda's output works natively, so two TEMPORARY
 * downleveling plugins run in PRODUCTION builds only (dev browsers are modern,
 * and the flattened @layer output makes devtools tracing painful). Drop both —
 * and raise BUILD_TARGETS — once support rises past those browsers.
 *
 * 1. expandLogicalShorthands (@microbit/ui/postcss-legacy-safari) — Safari 14.x
 *    silently drops logical *shorthands* whose value contains var()
 *    (`padding-inline: var(--…)` applies nothing). Panda emits these for its
 *    px/py/mx/my utilities. Expands each into its logical -start/-end longhands
 *    (which work), so RTL still flips.
 * 2. @csstools/postcss-cascade-layers — Safari <15.4 drops @layer wholesale.
 *
 * Panda's own PostCSS plugin runs first in all envs: it generates the CSS
 * during the bundle, injected into the layer order declared in
 * src/layers.css.
 */
const {
  expandLogicalShorthands,
} = require("@microbit/ui/postcss-legacy-safari");

module.exports = (ctx) => ({
  plugins: [
    require("@pandacss/dev/postcss")(),
    ...(ctx.env === "production"
      ? [expandLogicalShorthands(), require("@csstools/postcss-cascade-layers")]
      : []),
  ],
});
