/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useCallback, useState } from "react";

type storageType = "local" | "session";

/**
 * Local and session storage-backed state (via JSON serialization).
 */
export function useStorage<T extends object>(
  storageType: storageType,
  key: string,
  defaultValue: T,
  validate?: (x: unknown) => x is T,
  overrides?: Partial<T>
): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    const storage =
      storageType === "local"
        ? localStorageIfPossible()
        : sessionStorageIfPossible();
    const value = storage ? storage.getItem(key) : null;
    const overiddenDefault = { ...defaultValue, ...overrides };
    if (value !== null) {
      try {
        let parsed = JSON.parse(value);
        // Ensure we get new top-level defaults.
        parsed = {
          ...defaultValue,
          ...parsed,
          ...overrides,
        };
        // Remove any top-level keys that aren't present in defaults.
        const unknownKeys = new Set(Object.keys(parsed));
        Object.keys(defaultValue).forEach((k) => unknownKeys.delete(k));
        unknownKeys.forEach((k) => delete parsed[k]);

        if (validate && !validate(parsed)) {
          throw new Error(`Invalid data stored in ${storageType} storage`);
        }

        return parsed;
      } catch (e) {
        // Better than exploding forever.
        return overiddenDefault;
      }
    }
    return overiddenDefault;
  });
  const setAndSaveState = useCallback(
    (value: T) => {
      const storage =
        storageType === "local"
          ? localStorageIfPossible()
          : sessionStorageIfPossible();
      if (storage) {
        storage.setItem(key, JSON.stringify(value));
      }
      setState(value);
    },
    [setState, key, storageType]
  );
  return [state, setAndSaveState];
}

const localStorageIfPossible = () => {
  try {
    return window.localStorage;
  } catch (e) {
    // Handle possible SecurityError, absent window.
    return undefined;
  }
};

const sessionStorageIfPossible = () => {
  try {
    return window.sessionStorage;
  } catch (e) {
    // Handle possible SecurityError, absent window.
    return undefined;
  }
};
