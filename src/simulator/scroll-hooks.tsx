import {
  UIEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export const useAutoScrollToBottom = (
  dependency: any
): [React.RefObject<HTMLDivElement>, UIEventHandler] => {
  const first = useRef(true);
  const [enabled, setEnabled] = useState<boolean>(true);
  const ref = useRef<HTMLDivElement>(null);
  const handleScroll = useCallback(
    (_: React.UIEvent) => {
      const element = ref.current!;
      const isAtBottom =
        element.scrollHeight - element.scrollTop === element.clientHeight;
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
