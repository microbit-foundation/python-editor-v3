/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
/**
 * The Jacdac Python modules — one standalone flat module per sensor type, so
 * only the sensors a program actually uses get added to the project and flashed
 * (the micro:bit filesystem is flat and small). Each module's source feeds both
 * the language-server stub and the project file, so the two never drift.
 */
import { extractModuleData } from "../../fs/fs-util";
import { JacdacRoleType } from "../parse-roles";
import jacdacButton from "./JacdacButton.py?raw";
import jacdacRotaryEncoder from "./JacdacRotaryEncoder.py?raw";
import jacdacSlider from "./JacdacSlider.py?raw";

export interface JacdacModule {
  /** Module and class name, e.g. "JacdacButton" (module file: JacdacButton.py). */
  className: string;
  type: JacdacRoleType;
  source: string;
}

export const JACDAC_MODULES: JacdacModule[] = [
  { className: "JacdacButton", type: "button", source: jacdacButton },
  {
    className: "JacdacRotaryEncoder",
    type: "rotary-encoder",
    source: jacdacRotaryEncoder,
  },
  { className: "JacdacSlider", type: "slider", source: jacdacSlider },
];

/**
 * True if the given source is one of our Jacdac modules, identified by its magic
 * module comment's name (not just the filename), so a user's own same-named file
 * is not treated as ours. Jacdac modules are managed by the editor and shown
 * read-only.
 */
export const isJacdacModuleSource = (source: string): boolean => {
  const name = extractModuleData(source)?.name;
  return !!name && JACDAC_MODULES.some((m) => m.className === name);
};

/**
 * True if the filename is one of our managed Jacdac module files (e.g.
 * "JacdacButton.py"). Used where only the name is available (the project file
 * list); prefer isJacdacModuleSource when the content is available.
 */
export const isJacdacModuleFilename = (filename: string): boolean =>
  JACDAC_MODULES.some((m) => `${m.className}.py` === filename);
