/**
 * Utility-style hooks only.
 */
import { useEffect, useRef } from "react";

/**
 * A hook that returns the previous value.
 *
 * @param value The value to track. Returns undefined for first render.
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

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
