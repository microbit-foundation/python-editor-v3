/**
 * Utility-style hooks only.
 */
import { useEffect } from "react";
import { usePrevious } from "./use-previous";

/**
 * A hook that can run an action if a variable updated.
 *
 * @param current The current value.
 * @param onUpdate The action to take if it has changed.
 */
export function useDidUpdate<T>(
  current: T,
  onUpdate: (previous: T | undefined, current: T) => void
): void {
  const previous = usePrevious<T>(current);
  useEffect(() => {
    if (previous !== current) {
      onUpdate(previous, current);
    }
  }, [onUpdate, previous, current]);
}
