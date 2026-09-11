/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useSyncExternalStore } from "react";

// The storage opens at module load, before React mounts, so the outcome is
// held here for the UI to read rather than passed through props.
let versionError: unknown;
const listeners = new Set<() => void>();

/**
 * Records that the project library was created by an incompatible version
 * of the app. Only used on non-public stages, where the fix is to clear it.
 */
export const reportStorageVersionError = (error: unknown): void => {
  versionError = error;
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useStorageVersionError = (): unknown =>
  useSyncExternalStore(subscribe, () => versionError);

/** For tests. */
export const resetStorageStatus = (): void => {
  versionError = undefined;
};
