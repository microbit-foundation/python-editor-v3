import { stage } from "./environment";

// Simple feature flags.
// Features disabled here even in preview are not ready for feedback.

interface Flags {
  signatureHelp: boolean;
}

const isPreviewStage = () => !(stage === "STAGING" || stage === "PRODUCTION");

export const flags: Flags = isPreviewStage()
  ? {
      signatureHelp: true,
    }
  : { signatureHelp: false };
