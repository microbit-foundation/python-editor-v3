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

interface Flags {
  signatureHelp: boolean;
  autocompleteDocs: boolean;
  // We'll ship this when we have more beginner friendly docs.
  advancedDocumentation: boolean;
}

const isPreviewStage = () => !(stage === "STAGING" || stage === "PRODUCTION");

export const flags: Flags = isPreviewStage()
  ? {
      signatureHelp: true,
      autocompleteDocs: true,
      advancedDocumentation: true,
    }
  : {
      signatureHelp: false,
      autocompleteDocs: false,
      advancedDocumentation: false,
    };
