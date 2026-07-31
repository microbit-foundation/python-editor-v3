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
import jacdacButton from "./jacdac_button.py?raw";
import jacdacLedRing from "./jacdac_led_ring.py?raw";
import jacdacRotaryEncoder from "./jacdac_rotary_encoder.py?raw";
import jacdacServo from "./jacdac_servo.py?raw";
import jacdacSlider from "./jacdac_slider.py?raw";

export interface JacdacModule {
  /** Module and class name, e.g. "jacdac_button" (module file: jacdac_button.py). */
  className: string;
  type: JacdacRoleType;
  source: string;
}

export const JACDAC_MODULES: JacdacModule[] = [
  { className: "jacdac_button", type: "button", source: jacdacButton },
  {
    className: "jacdac_rotary_encoder",
    type: "rotary-encoder",
    source: jacdacRotaryEncoder,
  },
  { className: "jacdac_slider", type: "slider", source: jacdacSlider },
  { className: "jacdac_led_ring", type: "led-ring", source: jacdacLedRing },
  { className: "jacdac_servo", type: "servo", source: jacdacServo },
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
 * "jacdac_button.py"). Used where only the name is available (the project file
 * list); prefer isJacdacModuleSource when the content is available.
 */
export const isJacdacModuleFilename = (filename: string): boolean =>
  JACDAC_MODULES.some((m) => `${m.className}.py` === filename);
