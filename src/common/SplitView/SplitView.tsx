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
import { Direction, separatorPixels, splitViewContext } from "./context";

interface SplitViewProps extends Omit<FlexProps, "children" | "direction"> {
  children: [JSX.Element, JSX.Element, JSX.Element];
  direction: Direction;
  minimums: [number, number];
}

export const SplitView = ({
  children,
  direction,
  minimums,
  ...props
}: SplitViewProps) => {
  const [sizedPaneSize, setSizedPaneSize] = useState<undefined | number>(
    minimums[0]
  );
  const [dragging, setDragging] = useState(false);
  const splitViewRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setDragging(true);
      const cursor = direction === "row" ? "col-resize" : "row-resize";
      // Avoids cursor flicker.
      splitViewRef.current!.style.cursor = cursor;
    },
    [setDragging, direction]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      setDragging(true);
    },
    [setDragging]
  );

  const handleMove = useCallback(
    (e: Event, clientPos: number) => {
      if (dragging) {
        const rect = splitViewRef.current!.getBoundingClientRect();

        // This needs to know whether the thing it's sizing
        // is before or after the one that takes the remainder.
        let size = rect.bottom - clientPos;
        // clientPos - (direction === "column" ? rect.bottom : rect.left);

        if (size < minimums[0]) {
          size = minimums[0];
        }
        // Check remaining space for other component vs its minimum
        const maximum =
          (direction === "column" ? rect.height : rect.width) -
          separatorPixels -
          minimums[1];
        if (size > maximum) {
          size = maximum;
        }
        setSizedPaneSize(size);
      }
    },
    [dragging, setSizedPaneSize, splitViewRef, minimums, direction]
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

  const context = useMemo(() => {
    return {
      sizedPaneSize,
      setSizedPaneSize,
      direction,
      handleTouchStart,
      handleMouseDown,
      handleMouseMove,
      handleTouchEndOrMouseUp,
    };
  }, [
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
