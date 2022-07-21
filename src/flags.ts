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
  | "noWelcome";

interface FlagMetadata {
  defaultOnStages: string[];
  name: Flag;
}

const allFlags: FlagMetadata[] = [
  // Alphabetical order.
  { name: "audioSoundEffect", defaultOnStages: [] },
  { name: "dndDebug", defaultOnStages: [] },
  { name: "livePreview", defaultOnStages: ["REVIEW"] },
  { name: "noWelcome", defaultOnStages: ["REVIEW"] },
];

type Flags = Record<Flag, boolean>;

// Exposed for testing.
export const flagsForParams = (stage: string, params: URLSearchParams) => {
  const enableFlags = new Set(params.getAll("flag"));
  const allFlagsDisabledByDefault = enableFlags.has("none");
  const allFlagsEnabledByDefault =
    !allFlagsDisabledByDefault && enableFlags.has("*");
  return Object.fromEntries(
    allFlags.map((f) => {
      const explicitlyEnabled = enableFlags.has(f.name);
      const enabled =
        explicitlyEnabled ||
        (!allFlagsEnabledByDefault && f.defaultOnStages.includes(stage));
      return [f.name, enabled];
    })
  ) as Flags;
};

export const flags: Flags = (() => {
  const params = new URLSearchParams(window.location.search);
  return flagsForParams(stageFromEnvironment, params);
})();
