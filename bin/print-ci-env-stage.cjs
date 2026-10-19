#!/usr/bin/env node
// STAGE is the deployment stage, set by the build matrix
// (bin/print-ci-stages.cjs). Beta is main's build for public use, so it
// behaves as staging: same simulator, analytics and flags.
const stage = process.env.STAGE;
if (!stage) {
  throw new Error("STAGE must be set by the build matrix");
}

console.log(`VITE_STAGE=${stage === "BETA" ? "STAGING" : stage}`);
