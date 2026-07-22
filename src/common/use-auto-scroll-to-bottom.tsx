/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  UIEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

/**
 * Keeps a scroll container pinned to the bottom as new content arrives,
 * unless the user has scrolled up.
 *
 * Shared by the simulator radio/data-logging modules and the serial chat.
 */
export const useAutoScrollToBottom = (
  dependency: any
): [React.RefObject<HTMLDivElement>, UIEventHandler] => {
  const first = useRef(true);
  const [enabled, setEnabled] = useState<boolean>(true);
  const ref = useRef<HTMLDivElement>(null);
  const handleScroll = useCallback(
    (_: React.UIEvent) => {
      const element = ref.current!;
      // Small tolerance so sub-pixel rounding (or an in-flight smooth
      // scroll) doesn't wrongly latch auto-scroll off.
      const isAtBottom =
        element.scrollHeight - element.scrollTop - element.clientHeight <= 2;
      setEnabled(isAtBottom);
    },
    [ref, setEnabled]
  );
  useEffect(() => {
    if (enabled && ref.current) {
      let prev: string = "unset";
      // Ensure we don't smooth scroll for the first render or new rows
      // may mean we don't ever make it to the bottom and so don't
      // continue to scroll.
      if (first.current) {
        prev = ref.current.style.scrollBehavior;
        ref.current.style.scrollBehavior = "unset";
      }
      ref.current.scrollTop = ref.current.scrollHeight;
      if (first.current) {
        first.current = false;
        ref.current.style.scrollBehavior = prev;
      }
    }
  }, [enabled, dependency]);
  return [ref, handleScroll];
};
