import { useCallback, useEffect, useState } from "react";
import { usePrevious } from "./use-previous";

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
        const parsed = JSON.parse(value);
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
    [setState]
  );
  return [state, setAndSaveState];
}
