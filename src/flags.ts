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

import { stage as stageFromEnvironment } from "./environment";

/**
 * A union of the flag names (alphabetical order).
 */
export type Flag =
  /**
   * Enables a preview of SoundEffects via the audio-sound-effect MicroPython branch.
   */
  | "audioSoundEffect"

  /**
   * Enables verbose debug logging to the console of drag events.
   */
  | "dndDebug"

  /**
   * Flag to enable live-only features and hide beta only ones.
   *
   * We'll remove this when we go live.
   */
  | "livePreview"

  /**
   * Disables the pop-up welcome dialog.
   *
   * Added to support user-testing and has the nice side-effect of disabling
   * the dialog for local development so is worth keeping for that use alone.
   */
  | "noWelcome"
  /**
   * Simulator radio support.
   */
  | "simRadio";

interface FlagMetadata {
  defaultOnStages: string[];
  name: Flag;
}

const allFlags: FlagMetadata[] = [
  // Alphabetical order.
  { name: "audioSoundEffect", defaultOnStages: [] },
  { name: "dndDebug", defaultOnStages: [] },
  { name: "livePreview", defaultOnStages: ["local", "REVIEW"] },
  { name: "noWelcome", defaultOnStages: ["local", "REVIEW"] },
  { name: "simRadio", defaultOnStages: [] },
];

type Flags = Record<Flag, boolean>;

// Exposed for testing.
export const flagsForParams = (stage: string, params: URLSearchParams) => {
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
  stage: string,
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
