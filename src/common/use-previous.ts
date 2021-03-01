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
