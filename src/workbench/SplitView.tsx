/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, Flex, FlexProps } from "@chakra-ui/layout";
import React, {
  createRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const separatorPixels = 5;

/**
 * The simple subset of flex direction.
 */
type Direction = "row" | "column";

const dimensionPropName = (direction: Direction) =>
  direction === "column" ? "height" : "width";

const dimensionProps = (direction: Direction, value: number | string) => {
  return {
    [dimensionPropName(direction)]: value,
  };
};

interface SplitViewProps extends Omit<FlexProps, "children" | "direction"> {
  children: [JSX.Element, JSX.Element];
  direction: Direction;
  minimums: [number, number];
}

interface SizedPaneProps {
  size: number | undefined;
  setSize: (value: number) => void;
  children: JSX.Element;
  direction: Direction;
}

/**
 * The pane we give an explicit size to.
 *
 * The other pane takes the remaining space.
 */
const SizedPane = ({
  children,
  size: firstSize,
  setSize: setFirstSize,
  direction,
}: SizedPaneProps) => {
  const firstRef = createRef<HTMLDivElement>();
  useEffect(() => {
    if (firstRef.current) {
      firstRef.current.style[dimensionPropName(direction)] = `${firstSize}px`;
    }
  }, [firstRef, firstSize, setFirstSize, direction]);
  return <Box ref={firstRef}>{children}</Box>;
};

export const SplitView = ({
  children,
  direction,
  minimums,
  ...props
}: SplitViewProps) => {
  const [firstChild, secondChild] = children;
  const [sizedPaneSize, setSizedPaneSize] = useState<undefined | number>(
    minimums[0]
  );
  const [dragging, setDragging] = useState(false);
  const splitViewRef = useRef<HTMLDivElement>(null);
  const cursor = direction === "row" ? "col-resize" : "row-resize";

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setDragging(true);
      // Avoids cursor flicker.
      splitViewRef.current!.style.cursor = cursor;
    },
    [setDragging, cursor]
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
        let size = clientPos - (direction === "column" ? rect.top : rect.left);
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

  return (
    <Flex ref={splitViewRef} direction={direction} {...props} width="100%">
      <SizedPane
        size={sizedPaneSize}
        setSize={setSizedPaneSize}
        direction={direction}
      >
        {firstChild}
      </SizedPane>
      <Flex
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEndOrMouseUp}
        cursor={cursor}
        alignSelf="stretch"
        alignItems="center"
      >
        <Box
          height="100%"
          {...dimensionProps(direction, `${separatorPixels}px`)}
          backgroundColor="gray.50"
        />
      </Flex>
      <Box
        {...dimensionProps(
          direction,
          `calc(100% - ${sizedPaneSize}px - ${separatorPixels}px)`
        )}
      >
        {secondChild}
      </Box>
    </Flex>
  );
};

export default SplitView;
