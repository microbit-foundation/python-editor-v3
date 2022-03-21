/**
 * A CoreMirror view extension providing structural highlighting using
 * CodeMirror's syntax tree.
 *
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

import { Extension } from "@codemirror/state";
import { baseTheme } from "./theme";
import { codeStructureView } from "./view";

export type CodeStructureShape = "l-shape" | "box";
export type CodeStructureBackground = "block" | "none";
export type CodeStructureBorders = "borders" | "none" | "left-edge-only";

export interface CodeStructureSettings {
  shape: CodeStructureShape;
  background: CodeStructureBackground;
  borders: CodeStructureBorders;

  cursorBackground?: boolean;
  cursorBorder?: CodeStructureBorders;
}

/**
 * Creates a CodeMirror extension that provides structural highlighting
 * based on the CodeMirror syntax tree. The intent is to aid code comprehension
 * and provide clues when indentation isn't correct.
 *
 * @param settings Settings for the code structure CodeMirror extension.
 * @returns A appropriately configured extension.
 */
export const codeStructure = (settings: CodeStructureSettings): Extension => {
  return [codeStructureView(settings), baseTheme];
};
