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
