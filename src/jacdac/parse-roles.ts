/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

export type JacdacRoleType =
  | "button"
  | "rotary-encoder"
  | "slider"
  | "led-ring"
  | "servo";

export interface ParsedRole {
  /** The role name string as written in the user's code. */
  name: string;
  /** The supported sensor type, from the constructor called. */
  type: JacdacRoleType;
}

const CLASS_TO_TYPE: Record<string, JacdacRoleType> = {
  jacdac_button: "button",
  jacdac_rotary_encoder: "rotary-encoder",
  jacdac_slider: "slider",
  jacdac_led_ring: "led-ring",
  jacdac_servo: "servo",
};

/**
 * Map a role constructor name (e.g. "jacdac_button") to its sensor type. Roles
 * are parsed in Pyright (the pyright/jacdacRoles request); reserved-character
 * detection is a Pyright checker diagnostic. This just maps the result to a type.
 */
export const roleTypeForConstructor = (
  constructorName: string
): JacdacRoleType | undefined => CLASS_TO_TYPE[constructorName];
