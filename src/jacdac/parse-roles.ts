/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

export type JacdacRoleType = "button" | "rotary-encoder" | "slider";

export interface ParsedRole {
  /** The role name string as written in the user's code. */
  name: string;
  /** The supported sensor type, from the constructor called. */
  type: JacdacRoleType;
}

const CLASS_TO_TYPE: Record<string, JacdacRoleType> = {
  Button: "button",
  RotaryEncoder: "rotary-encoder",
  Slider: "slider",
};

/**
 * Extract Jacdac role names from Python source.
 *
 * POC-simple: a regex over the source matching the one supported pattern —
 * `Jacdac.<Button|RotaryButton|Slider>("role name")` with a string literal
 * argument. Deliberately not a full parse; the user's code is the source of
 * truth and we only support literal-string role names (see the POC spec).
 * Duplicate role names are ignored (role names are unique across a program).
 */
export const parseRoles = (source: string): ParsedRole[] => {
  const re = /Jacdac\.(Button|RotaryEncoder|Slider)\s*\(\s*["']([^"'\n]+)["']/g;
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
