/**
 * Simple feature flags.
 *
 * Features disabled here even in preview are not ready for feedback.
 *
 * Preview features are not ready for general use.
 *
 * (c) 2021 - 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

import { Stage, stage as stageFromEnvironment } from "./environment";

/**
 * A union of the flag names (alphabetical order).
 */
export type Flag =
  /**
   * Flag to add a beta notice. Enabled for staging site but not production stages.
   */
  | "betaNotice"
  /**
   * Enables verbose debug logging to the console of drag events.
   */
  | "dndDebug"
  /**
   * Shows CMS drafts in preference to live content.
   *
   * Currently only supported for the reference content.
   */
  | "drafts"
  /**
   * Disables language selection from the settings menu.
   *
   * Added so we can embed the editor in micro:bit classroom without competing language
   * options. The language selected in classroom is passed through via query param.
   */
  | "noLang"
  /**
   * Disables the pop-up welcome dialog.
   *
   * Added to support user-testing and has the nice side-effect of disabling
   * the dialog for local development so is worth keeping for that use alone.
   */
  | "noWelcome";

interface FlagMetadata {
  defaultOnStages: Stage[];
  name: Flag;
}

const allFlags: FlagMetadata[] = [
  // Alphabetical order.
  { name: "dndDebug", defaultOnStages: [] },
  { name: "drafts", defaultOnStages: ["local", "REVIEW"] },
  { name: "betaNotice", defaultOnStages: ["local", "REVIEW", "STAGING"] },
  { name: "noWelcome", defaultOnStages: ["local", "REVIEW"] },
  { name: "noLang", defaultOnStages: [] },
];

type Flags = Record<Flag, boolean>;

// Exposed for testing.
export const flagsForParams = (stage: Stage, params: URLSearchParams) => {
  const enableFlags = new Set(params.getAll("flag"));
  const allFlagsDefault = enableFlags.has("none")
    ? false
    : enableFlags.has("*")
    ? true
    : undefined;
  return Object.fromEntries(
    allFlags.map((f) => [
      f.name,
      isEnabled(f, stage, allFlagsDefault, enableFlags.has(f.name)),
    ])
  ) as Flags;
};

const isEnabled = (
  f: FlagMetadata,
  stage: Stage,
  allFlagsDefault: boolean | undefined,
  thisFlagOn: boolean
): boolean => {
  if (thisFlagOn) {
    return true;
  }
  if (allFlagsDefault !== undefined) {
    return allFlagsDefault;
  }
  return f.defaultOnStages.includes(stage);
};

export const flags: Flags = (() => {
  const params = new URLSearchParams(window.location.search);
  return flagsForParams(stageFromEnvironment, params);
})();
