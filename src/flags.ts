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

type Flag = "signatureHelp";

type Flags = Record<Flag, boolean>;

export const flags: Flags = (() => {
  const isPreviewStage = !(stage === "STAGING" || stage === "PRODUCTION");
  const flags = ["signatureHelp"];
  const params = new URLSearchParams(window.location.search);
  const enableFlags = new Set(params.getAll("flag"));
  const allFlagsEnabled = enableFlags.has("*");
  // To allow local testing of no-flag state.
  const allFlagsDisabled = enableFlags.has("none");
  return Object.fromEntries(
    flags.map((f) => {
      return [
        f,
        !allFlagsDisabled &&
          (isPreviewStage || allFlagsEnabled || enableFlags.has(f)),
      ];
    })
  ) as Flags;
})();
