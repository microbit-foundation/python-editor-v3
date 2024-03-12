/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Flex, FlexProps } from "@chakra-ui/layout";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import useRafState from "../use-raf-state";
import {
  Direction,
  separatorPixels,
  SplitViewContext,
  splitViewContext,
} from "./context";
import SplitViewSized from "./SplitViewSized";

export type SizedMode = "collapsed" | "compact" | "open";

interface SplitViewProps extends Omit<FlexProps, "children" | "direction"> {
  mode?: SizedMode;
  children: [JSX.Element, JSX.Element, JSX.Element];
  direction: Direction;
  compactSize?: number;
  initialSize?: number;
  minimums: [number, number];
}

/**
 * An adjustable vertical or horizontal split area.
 *
 * Expects SplitViewSized, SplitViewDivider and SplitViewRemainder
 * children. The sized and remainder components can be in either
 * order.
 */
export const SplitView = ({
  children,
  direction,
  initialSize,
  minimums,
  mode = "open",
  compactSize = 0,
  ...props
}: SplitViewProps) => {
  const sizedFirst = children[0].type === SplitViewSized;
  const [sizedPaneSize, setSizedPaneSize] = useRafState<undefined | number>(
    initialSize || minimums[0]
  );
  const [dragging, setDragging] = useState(false);
  const splitViewRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(
    (_: React.MouseEvent) => {
      setDragging(true);
      const cursor = direction === "row" ? "col-resize" : "row-resize";
      // Avoids cursor flicker.
      splitViewRef.current!.style.cursor = cursor;
    },
    [setDragging, direction]
  );

  const handleTouchStart = useCallback(
    (_: React.TouchEvent) => {
      setDragging(true);
    },
    [setDragging]
  );

  const handleMove = useCallback(
    (_: Event, clientPos: number) => {
      if (dragging) {
        const rect = splitViewRef.current!.getBoundingClientRect();
        const relativeTo =
          direction === "column"
            ? sizedFirst
              ? rect.top
              : rect.bottom
            : sizedFirst
            ? rect.left
            : rect.right;
        let size = Math.abs(relativeTo - clientPos);
        if (size < minimums[0]) {
          size = minimums[0];
        }
        // Check remaining space for other component vs its minimum
        // The window can be too small for the sum of the minimums,
        // we sacrifice the unsized component in this case.
        const maximum =
          (direction === "column" ? rect.height : rect.width) -
          separatorPixels -
          minimums[1];
        if (size > maximum) {
          size = maximum;
        }
        const minimum = minimums[0] - separatorPixels;
        if (size < minimum) {
          size = minimum;
        }
        setSizedPaneSize(size);
      }
    },
    [dragging, setSizedPaneSize, splitViewRef, minimums, direction, sizedFirst]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (dragging) {
        e.preventDefault();
        handleMove(e, direction === "column" ? e.clientY : e.clientX);
      }
    },
    [dragging, handleMove, direction]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      handleMove(e, e.touches[0].clientX);
    },
    [handleMove]
  );

  const handleTouchEndOrMouseUp = useCallback(() => {
    setDragging(false);
    splitViewRef.current!.style.cursor = "unset";
  }, [setDragging]);

  useEffect(() => {
    // This only act if we're dragging at the time.
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("mouseup", handleTouchEndOrMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("mouseup", handleTouchEndOrMouseUp);
    };
  }, [handleMouseMove, handleTouchMove, handleTouchEndOrMouseUp]);

  const context: SplitViewContext = useMemo(() => {
    return {
      dragging,
      mode,
      compactSize,
      sizedPaneSize,
      setSizedPaneSize,
      direction,
      handleTouchStart,
      handleMouseDown,
      handleMouseMove,
      handleTouchEndOrMouseUp,
    };
  }, [
    dragging,
    mode,
    compactSize,
    sizedPaneSize,
    setSizedPaneSize,
    direction,
    handleTouchStart,
    handleMouseDown,
    handleMouseMove,
    handleTouchEndOrMouseUp,
  ]);

  return (
    <splitViewContext.Provider value={context}>
      <Flex ref={splitViewRef} direction={direction} {...props} width="100%">
        {children}
      </Flex>
    </splitViewContext.Provider>
  );
};

export default SplitView;
