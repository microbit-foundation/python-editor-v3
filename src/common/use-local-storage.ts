/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useCallback, useState } from "react";

/**
 * Local storage-backed state (via JSON serialization).
 */
export function useLocalStorage<T>(
  key: string,
  validate: (x: unknown) => x is T,
  defaultValue: T
): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    const value = localStorage.getItem(key);
    if (value !== null) {
      try {
        let parsed = JSON.parse(value);
        // Ensure we get new top-level defaults.
        parsed = {
          ...defaultValue,
          ...parsed,
        };
        // Remove any top-level keys that aren't present in defaults.
        const unknownKeys = new Set(Object.keys(parsed));
        Object.keys(defaultValue).forEach((k) => unknownKeys.delete(k));
        unknownKeys.forEach((k) => delete parsed[k]);

        if (!validate(parsed)) {
          throw new Error("Invalid data stored in local storage");
        }

        return parsed;
      } catch (e) {
        // Better than exploding forever.
        return defaultValue;
      }
    }
    return defaultValue;
  });
  const setAndSaveState = useCallback(
    (value: T) => {
      localStorage.setItem(key, JSON.stringify(value));
      setState(value);
    },
    [setState, key]
  );
  return [state, setAndSaveState];
}
