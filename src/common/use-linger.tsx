/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useEffect, useState } from "react";

/**
 * Follows `value`, but holds a true→false change for `ms` first. Going back
 * to true (a flip back within the delay) is immediate and cancels the pending
 * change.
 *
 * Use it to tell a momentary blip apart from a real change - e.g. a program
 * restart (chat briefly inactive, then active again) vs. a genuine stop.
 */
export const useLinger = (value: boolean, ms: number): boolean => {
  const [lingered, setLingered] = useState(value);
  useEffect(() => {
    if (value) {
      setLingered(true);
      return;
    }
    const timer = setTimeout(() => setLingered(false), ms);
    return () => clearTimeout(timer);
  }, [value, ms]);
  return lingered;
};
