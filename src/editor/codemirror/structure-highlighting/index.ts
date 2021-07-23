/**
 * A CoreMirror view extension providing structural highlighting using
 * CodeMirror's syntax tree.
 *
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

import { Compartment, Extension } from "@codemirror/state";
import { CodeStructureHighlight } from "../../../settings/settings";
import { baseTheme, themeTweakForBackgrounds } from "./theme";
import { codeStructureView } from "./view";

export const structureHighlightingCompartment = new Compartment();

export interface CodeStructureSettings {
  shape: "l-shape" | "box";
  background: "block" | "none";
  borders: "borders" | "no-borders" | "left-edge-only";

  hoverBackground?: boolean;
  cursorBackground?: boolean;
  hoverBorder?: boolean;
  cursorBorder?: boolean;
}

// We'll switch to exporting this soon, see below.
const codeStructure = (settings: CodeStructureSettings): Extension => [
  codeStructureView(settings),
  baseTheme,
  settings.background !== "none" ||
  settings.cursorBackground ||
  settings.hoverBackground
    ? themeTweakForBackgrounds
    : [],
];

// This will go soon in favour of more fine-grained settings
export const structureHighlighting = (
  option: CodeStructureHighlight
): Extension => {
  switch (option) {
    case "l-shapes":
      return codeStructure({
        shape: "l-shape",
        background: "none",
        borders: "left-edge-only",
      });
    case "boxes":
      return codeStructure({
        shape: "box",
        background: "block",
        borders: "no-borders",
      });
    case "l-shape-boxes":
      return codeStructure({
        shape: "l-shape",
        background: "block",
        borders: "no-borders",
      });
    case "none":
      return [];
    default:
      return [];
  }
};
