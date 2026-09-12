/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useSyncExternalStore } from "react";

// The storage opens at module load, before React mounts, so the outcome is
// held here for the UI to read rather than passed through props.
let versionError: unknown;
let projectsDatabaseActive = false;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

/**
 * Records that the projects database was created by an incompatible version
 * of the app. Only used on non-public stages, where the fix is to clear it.
 */
export const reportStorageVersionError = (error: unknown): void => {
  versionError = error;
  notify();
};

/**
 * Records that the open project is in the projects database, which outlives
 * the tab. Not reported for the session-storage fallback or in iframe mode,
 * where closing the tab still loses the work.
 */
export const reportProjectsDatabaseActive = (): void => {
  projectsDatabaseActive = true;
  notify();
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const hasStorageVersionError = (): boolean => versionError !== undefined;

export const useStorageVersionError = (): unknown =>
  useSyncExternalStore(subscribe, () => versionError);

export const useProjectsDatabaseActive = (): boolean =>
  useSyncExternalStore(subscribe, () => projectsDatabaseActive);

/** For tests. */
export const resetStorageStatus = (): void => {
  versionError = undefined;
  projectsDatabaseActive = false;
};
