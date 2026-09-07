/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

/**
 * Whether the current build stage routes analytics to a real backend.
 *
 * Limited to PRODUCTION and STAGING so REVIEW and local dev don't
 * pollute the live property with developer / preview traffic. Used by
 * the web cookie modal config to omit the GA opt-in section.
 */
export const isStageWithAnalytics = (stage: string | undefined): boolean =>
  stage === "PRODUCTION" || stage === "STAGING";
