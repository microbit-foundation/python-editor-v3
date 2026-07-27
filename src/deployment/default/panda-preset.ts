/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { definePreset } from "@pandacss/dev";

/**
 * The python-editor OSS app preset: this app's own styling decisions, merged
 * after the shared-ui base preset (@microbit/ui) and before the optional
 * private brand preset (see panda.config.ts). Kept minimal — the base preset
 * already supplies the token scales, recipes, `radii.button`, focus shadows,
 * Helvetica fonts and most semantic tokens.
 *
 * Values mirror the OSS Chakra theme (src/deployment/default) as converged
 * during the semantic-token pre-work; the private brand preset overrides the
 * brand-divergent token values.
 */
export const appPreset = definePreset({
  name: "python-editor-v3",
  theme: {
    extend: {
      tokens: {
        colors: {
          // Syntax-highlight / code-block palette. Consumed outside React as
          // CSS vars (CodeMirror highlight styles, structure highlighting), so
          // it's an app-preset token category; the private preset overrides the
          // values. OSS values are the Chakra defaults the old theme resolved.
          code: {
            blockBorder: { value: "#A0AEC0" }, // gray.400
            blockBackground: { value: "rgba(185, 185, 185, 0.1)" },
            blockBackgroundActive: { value: "rgba(255, 255, 237, 0.5)" },
            blockBorderActive: { value: "#4299e1" }, // blue.400
            comment: { value: "gray" },
            default: { value: "black" },
            keyword: { value: "darkblue" },
            literal: { value: "darkgreen" },
            string: { value: "green" },
            activeLine: { value: "#EDF2F7" }, // gray.100
            error: { value: "#E53E3E" }, // red.500 (matches default error toast)
          },
        },
      },
      semanticTokens: {
        colors: {
          // Sidebar chrome: Container `sidebar-header` bg + the Tabs `sidebar`
          // variant. OSS is flat black; the private preset uses brand colours /
          // a gradient (see the private panda-preset).
          sidebarHeaderBg: { value: "black" },
          sidebarTablistBg: { value: "black" },
          sidebarTabSelectedText: { value: "black" },
          sidebarTabSelectedBg: { value: "{colors.gray.50}" },
          // Button `language` variant text. The base preset defaults these to
          // the grey brand2 ramp; python-editor uses the primary brand ramp, so
          // the brand divergence flows through the brand ramp values.
          languageText: { value: "{colors.brand.500}" },
          languageTextHover: { value: "{colors.brand.600}" },
        },
      },
    },
  },
});

export default appPreset;
