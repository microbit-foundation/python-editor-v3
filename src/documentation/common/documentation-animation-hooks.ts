/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useState } from "react";
import { Anchor } from "../../router-hooks";

export type AnimationDirection = "forward" | "back" | "none";

/**
 * Compute the animation direction based on the change in the anchor.
 *
 * None for the anchor the panel mounts with (a reload, a link, opening an
 * idea from the home page), so only navigating within the panel animates.
 * Held until the anchor's id changes: dropping the animation class on an
 * unrelated re-render would cut a running animation short.
 *
 * @param anchor The current anchor state.
 * @returns A direction.
 */
export const useAnimationDirection = (
  anchor: Anchor | undefined
): AnimationDirection => {
  const id = anchor?.id;
  const [last, setLast] = useState<{
    id: string | undefined;
    direction: AnimationDirection;
  }>({ id, direction: "none" });
  if (last.id !== id) {
    const direction: AnimationDirection =
      !last.id && id ? "forward" : last.id && !id ? "back" : "none";
    setLast({ id, direction });
    return direction;
  }
  return last.direction;
};
