/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
export const version = import.meta.env.VITE_VERSION || "local";

export type Stage = "local" | "REVIEW" | "STAGING" | "PRODUCTION";

export const stage = (import.meta.env.VITE_STAGE || "local") as Stage;
