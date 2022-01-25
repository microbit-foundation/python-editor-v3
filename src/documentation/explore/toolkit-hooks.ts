/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { usePrevious } from "@chakra-ui/react";
import { Anchor } from "../../router-hooks";

export type AnimationDirection = "forward" | "back" | "none";

/**
 * Compute the animation direction based on the change in the anchor.
 *
 * @param anchor The current anchor state.
 * @returns A direction.
 */
export const useAnimationDirection = (
  anchor: Anchor | undefined
): AnimationDirection => {
  const previousAnchor = usePrevious(anchor);
  return !previousAnchor && anchor
    ? "forward"
    : previousAnchor && !anchor
    ? "back"
    : "none";
};
