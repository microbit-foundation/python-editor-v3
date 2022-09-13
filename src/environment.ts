/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
export const version = process.env.REACT_APP_VERSION || "local";

export type Stage = "local" | "REVIEW" | "STAGING" | "PRODUCTION";

export const stage = (process.env.REACT_APP_STAGE || "local") as Stage;
