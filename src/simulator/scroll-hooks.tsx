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
  const [enabled, setEnabled] = useState<boolean>(true);
  const ref = useRef<HTMLDivElement>(null);
  const handleScroll = useCallback(
    (e: React.UIEvent) => {
      const isAtBottom =
        ref.current!.scrollTop ===
        ref.current!.scrollHeight - ref.current!.offsetHeight;
      setEnabled(isAtBottom);
    },
    [ref, setEnabled]
  );
  useEffect(() => {
    if (enabled && ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [enabled, dependency]);
  return [ref, handleScroll];
};
