/**
 * A CoreMirror view extension providing structural highlighting using
 * CodeMirror's syntax tree.
 *
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

import { Extension } from "@codemirror/state";
import { CodeStructureOption } from "../../../settings/settings";
import { baseTheme } from "./theme";
import { codeStructureView } from "./view";

/**
 * Creates a CodeMirror extension that provides structural highlighting
 * based on the CodeMirror syntax tree. The intent is to aid code comprehension
 * and provide clues when indentation isn't correct.
 *
 * @param option Option for the code structure CodeMirror extension.
 * @returns A appropriately configured extension.
 */
export const codeStructure = (option: CodeStructureOption): Extension => {
  if (option === "none") {
    return [];
  }
  return [codeStructureView(option), baseTheme];
};
