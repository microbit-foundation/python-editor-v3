#!/usr/bin/env node
/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

// Prints the build matrix of deployment stages for GITHUB_OUTPUT. Each stage
// is its own build, as the base path differs. main builds staging
// (stage-python.microbit.org/v/3/) and beta (python.microbit.org/v/beta/).
const ref = process.env.GITHUB_REF;
let stages;
if (ref === "refs/heads/main") {
  stages = ["STAGING", "BETA"];
} else if (ref.startsWith("refs/tags/v")) {
  stages = ["PRODUCTION"];
} else {
  stages = ["REVIEW"];
}

// Playwright runs once per ref, before release.
const include = stages.map((stage) => ({
  stage,
  playwright: stage === "REVIEW" || stage === "STAGING",
}));
console.log(`matrix=${JSON.stringify({ include })}`);
