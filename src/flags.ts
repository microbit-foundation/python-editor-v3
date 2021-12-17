/**
 * Simple feature flags.
 *
 * Features disabled here even in preview are not ready for feedback.
 *
 * Preview features are not ready for general use.
 *
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

import { stage } from "./environment";

// A union of the flag names.
type Flag =
  /**
   * Enables experimental drag and drop features.
   */
  | "dnd"
  /**
   * Enables verbose debug logging to the console of drag events.
   */
  | "dndDebug"
  /**
   * Disables the pop-up welcome dialog.
   * The dialog is still available from the alpha release notice UI.
   * Added to support user-testing.
   *
   * The flag has the nice side-effect of disabling the dialog for
   * local development so is worth keeping for that use alone.
   */
  | "noWelcome";

const allFlags: Flag[] = ["dnd", "dndDebug", "noWelcome"];

type Flags = Record<Flag, boolean>;

export const flags: Flags = (() => {
  const isPreviewStage = !(stage === "STAGING" || stage === "PRODUCTION");
  const params = new URLSearchParams(window.location.search);
  const enableFlags = new Set(params.getAll("flag"));
  const allFlagsEnabled = enableFlags.has("*");
  // To allow local testing of no-flag state.
  const allFlagsDisabled = enableFlags.has("none");
  return Object.fromEntries(
    allFlags.map((f) => {
      return [
        f,
        !allFlagsDisabled &&
          (isPreviewStage || allFlagsEnabled || enableFlags.has(f)),
      ];
    })
  ) as Flags;
})();
