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

// A union of the flag names.
export type Flag =
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
  | "noWelcome"
  /**
   * Enables the ability to view content in the ideas tab while
   * it is work in progress.
   */
  | "ideas";

const allFlags: Flag[] = ["dndDebug", "noWelcome", "ideas"];

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
