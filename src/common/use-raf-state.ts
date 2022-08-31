/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Dispatch, SetStateAction, useCallback, useRef, useState } from "react";
import useIsUnmounted from "./use-is-unmounted";

/**
 * State that rate limits changes with request animation frame.
 *
 * Note that if you rely on the previous state value you'll get a stale one.
 */
const useRafState = <S>(
  initialState: S | (() => S)
): [S, Dispatch<SetStateAction<S>>] => {
  const animationFrame = useRef(-1);
  const isUnmounted = useIsUnmounted();
  const [state, setState] = useState(initialState);
  const setRafState: Dispatch<SetStateAction<S>> = useCallback(
    (value) => {
      cancelAnimationFrame(animationFrame.current);
      if (isUnmounted()) {
        return;
      }
      animationFrame.current = requestAnimationFrame(() => {
        setState(value);
      });
    },
    [isUnmounted]
  );
  return [state, setRafState];
};

export default useRafState;
