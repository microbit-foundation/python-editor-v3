/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { RefObject, useEffect, useState } from "react";

export const useResizeObserverContentRect = (
  ref: RefObject<HTMLElement>
): DOMRectReadOnly | undefined => {
  const [contentRect, setContentRect] = useState<DOMRectReadOnly | undefined>(
    undefined
  );
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.contentRect) {
          setContentRect(entry.contentRect);
        }
      });
    });
    if (ref.current) {
      resizeObserver.observe(ref.current);
    }
    return () => {
      resizeObserver.disconnect();
    };
  }, [ref]);
  return contentRect;
};
