/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { EditorView } from "@codemirror/view";

export const themeExtensions = (fontSize: string) => {
  const fontFamily = "var(--chakra-fonts-code)";
  return EditorView.theme({
    ".cm-content": {
      fontSize,
      fontFamily,
      padding: 0,
    },
    ".cm-gutters": {
      // Make it easier to copy code dragging from the left without line numbers.
      userSelect: "none",
      // Must be opaque for horizontal scrolling to work.
      backgroundColor: "var(--chakra-colors-gray-10)",
      fontSize,
      fontFamily,
      paddingRight: "1rem",
      border: "unset",
      color: "var(--chakra-colors-gray-600)",
    },
    // Widths to accomodate two gutters (lint and line numbers).
    ".cm-gutter.cm-gutter-lint": {
      width: "1.35em", // Needs to scale with the markers which are sized in em.
      minWidth: "unset",
    },
    ".cm-gutter": {
      minWidth: "2.2rem",
    },
    // Don't show markers for diagnostics at info level.
    ".cm-lint-marker-info": {
      display: "none",
    },
    ".cm-activeLine": {
      // Can't use background colour for conflicting purposes.
      backgroundColor: "unset",
      outline: "1px solid var(--chakra-colors-gray-100)",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "unset",
      color: "var(--chakra-colors-gray-800)",
    },
    // $wrap can't be styled here, see App.css.

    // This block restyles autocomplete and aims for a rectangular arrangement
    // rather than the default where the docs are positioned just offset from
    // the item in the completion list.
    ".cm-completionIcon": {
      // Seems broken by default
      width: "auto",
      // But they're also cryptic, so hide until we can improve.
      display: "none",
    },
    ".cm-completionLabel": {
      fontSize,
      fontFamily,
    },
    ".cm-tooltip": {
      backgroundColor: "var(--chakra-colors-gray-50) !important",
      border: "1px solid var(--chakra-colors-gray-400)",
    },
    ".cm-tooltip-autocomplete.cm-tooltip": {
      border: "none",
    },
    ".cm-tooltip-autocomplete.cm-tooltip > *": {
      border: "1px solid var(--chakra-colors-gray-400)",
    },
    ".cm-tooltip.cm-tooltip-autocomplete > ul > li[aria-selected]": {
      background: "#d7d4f0",
      color: "var(--chakra-colors-gray-800)",
    },
    ".cm-tooltip.cm-completionInfo.cm-completionInfo-right": {
      borderLeft: "none",
    },
    ".cm-tooltip.cm-completionInfo.cm-completionInfo-right-narrow": {
      position: "relative",
      left: 0,
      maxWidth: "unset !important",
    },
    ".cm-tooltip.cm-completionInfo.cm-completionInfo-left": {
      borderRight: "none",
    },
    ".cm-tooltip.cm-completionInfo.cm-completionInfo-left-narrow": {
      position: "relative",
      left: 0,
      maxWidth: "unset !important",
    },
    ".cm-tooltip.cm-completionInfo": {
      width: "20rem",
      height: "10.5rem",
      top: "0 !important",
      overflowY: "auto",
    },
    ".cm-tooltip.cm-tooltip-autocomplete > ul": {
      height: "10.5rem",
      maxHeight: "10.5rem",
    },
    ".cm-widgetBuffer": {
      display: "inline",
    },
    ".cm-line": {
      transition: "none",
      // This used to be the default until https://github.com/codemirror/view/commit/a2d7f9111872fe61ffad8fd3ea371a7a41650da6
      padding: "0 2px 0 4px",
    },
    ".cm-diagnosticAction": {
      marginLeft: 0,
      display: "block",
      backgroundColor: "unset",
      color: "var(--chakra-colors-brand-600)",
      fontSize: "0.9em",
      marginTop: "0.2em",
    },
    ".cm-diagnosticAction:hover": {
      textDecoration: "underline",
    },
    "ul:focus [aria-selected] .cm-diagnosticAction": {
      color: "var(--chakra-colors-gray-100)",
    },
  });
};

export default themeExtensions;
