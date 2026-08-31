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
 * Helvetica fonts and most semantic tokens. The private brand preset overrides
 * the brand-divergent token values.
 */
export const appPreset = definePreset({
  name: "python-editor-v3",
  theme: {
    extend: {
      // Documentation panel navigation transitions (HeadedScrollablePanel).
      keyframes: {
        slideInForward: {
          from: { transform: "translateX(100%)" },
        },
        slideInBack: {
          from: { transform: "translateX(-100%)" },
        },
      },
      tokens: {
        // This app's stacking contexts, calibrated against third-party
        // layers (xterm.js ~10, the library's overlay scale from 1000).
        // Token references are required in Panda styles: an
        // imported constant in a zIndex prop is not statically extractable
        // (silently unstyled).
        zIndex: {
          code: { value: 1 },
          breadcrumbContainer: { value: 2 },
          projectAreaMenu: { value: 3 },
          codePopUp: { value: 3 },
          sidebarHeader: { value: 3 },
          splitViewDivider: { value: 3 },
          splitViewHideButton: { value: 4 },
          aboveTerminal: { value: 20 },
          overlay: { value: 30 },
          aboveDialogs: { value: 1500 },
        },
        // The editor/terminal code face (both themes use the same value).
        // Consumed at runtime via token("fonts.code") (XTerm, CodeMirror).
        fonts: {
          code: { value: "Source Code Pro, monospace" },
        },
        colors: {
          // This app's very light grays differ slightly from the family base
          // preset's (gray.75 is #f5f6f8 here vs #f5f5f5).
          gray: {
            10: { value: "#fcfcfc" },
            75: { value: "#f5f6f8" },
          },
          // Syntax-highlight / code-block palette. Consumed outside React as
          // CSS vars (CodeMirror highlight styles, structure highlighting), so
          // it's an app-preset token category; the private preset overrides the
          // values.
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
          // `languageText`/`languageTextHover`: the base preset defaults are
          // brand.500/600 (since 0.1.0-alpha.6) — exactly this app's values,
          // so no override; divergence flows through the brand ramp.
        },
      },
      slotRecipes: {
        dialog: {
          base: {
            // This app's dialogs historically spaced action buttons with
            // ml={3}; the library house style is a wider gap 5.
            footer: { gap: "3" },
          },
        },
      },
      recipes: {
        // Default Text to `md` — 0.9rem on this app's shrunken scale, vs the
        // 16px an unsized <Text> would inherit. App-level because other apps
        // rely on inheritance (Text.recipe.ts).
        text: {
          defaultVariants: { size: "md" },
        },
        // The app's own button vocabulary; everything else is the base
        // recipe's, with destructive actions on `tone="danger"`.
        button: {
          variants: {
            variant: {
              // Icon buttons on the app's dark chrome (sidebar header,
              // serial bar): white glyph, white pill on hover.
              sidebar: {
                color: "white",
                bg: "transparent",
                _hover: { bg: "white", color: "gray.700" },
                _active: { bg: "white", color: "gray.800" },
              },
            },
          },
        },
      },
    },
  },
});

export default appPreset;
