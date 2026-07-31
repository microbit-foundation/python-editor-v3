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
 * Extract Jacdac role names from Python source.
 *
 * POC-simple: a regex over the source matching the one supported pattern —
 * `jacdac_<button|rotary_encoder|slider>("role name")` with a string literal
 * argument. Deliberately not a full parse; the user's code is the source of
 * truth and we only support literal-string role names (see the POC spec).
 * Duplicate role names are ignored (role names are unique across a program).
 */
export const parseRoles = (source: string): ParsedRole[] => {
  const re =
    /\b(jacdac_button|jacdac_rotary_encoder|jacdac_slider|jacdac_led_ring|jacdac_servo)\s*\(\s*["']([^"'\n]+)["']/g;
  const roles: ParsedRole[] = [];
  const seen = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = re.exec(source)) !== null) {
    const type = CLASS_TO_TYPE[match[1]];
    const name = match[2].trim();
    if (type && name && !seen.has(name)) {
      seen.add(name);
      roles.push({ name, type });
    }
  }
  return roles;
};
