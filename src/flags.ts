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

const allFlags: Flag[] = [
  // Alphabetical order.
  "audioSoundEffect",
  "dndDebug",
  "livePreview",
  "noWelcome",
];

type Flags = Record<Flag, boolean>;

// Exposed for testing.
export const flagsForParams = (stage: string, params: URLSearchParams) => {
  const isPreviewStage = !(stage === "STAGING" || stage === "PRODUCTION");
  const enableFlags = new Set(params.getAll("flag"));
  const allFlagsEnabled =
    (enableFlags.has("*") || isPreviewStage) && !enableFlags.has("none");
  return Object.fromEntries(
    allFlags.map((f) => {
      const enabled = allFlagsEnabled || enableFlags.has(f);
      return [f, enabled];
    })
  ) as Flags;
};

export const flags: Flags = (() => {
  const params = new URLSearchParams(window.location.search);
  return flagsForParams(stageFromEnvironment, params);
})();
