import { Box, Flex, FlexProps } from "@chakra-ui/layout";
import React, {
  createRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const separatorPixels = 5;

interface SplitViewProps extends Omit<FlexProps, "children"> {
  children: [JSX.Element, JSX.Element];
  minimums: [number, number];
}

interface FirstPaneProps {
  firstWidth: number | undefined;
  setFirstWidth: (value: number) => void;
  children: JSX.Element;
}

const FirstPane = ({ children, firstWidth, setFirstWidth }: FirstPaneProps) => {
  const firstRef = createRef<HTMLDivElement>();
  useEffect(() => {
    if (firstRef.current) {
      firstRef.current.style.width = `${firstWidth}px`;
    }
  }, [firstRef, firstWidth, setFirstWidth]);
  return <Box ref={firstRef}>{children}</Box>;
};

export const SplitView = ({ children, minimums, ...props }: SplitViewProps) => {
  const [firstChild, secondChild] = children;
  const [firstWidth, setFirstWidth] = useState<undefined | number>(minimums[0]);
  const [dragging, setDragging] = useState(false);
  const splitViewRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setDragging(true);
      // Avoids cursor flicker.
      splitViewRef.current!.style.cursor = "col-resize";
    },
    [setDragging]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      setDragging(true);
    },
    [setDragging]
  );

  const handleMove = useCallback(
    (e: Event, clientX: number) => {
      if (dragging) {
        const rect = splitViewRef.current!.getBoundingClientRect();
        let width = clientX - rect.left;
        if (width < minimums[0]) {
          width = minimums[0];
        }
        // Check remaining space for other component vs its minimum
        const maximum = rect.width - separatorPixels - minimums[1];
        if (width > maximum) {
          width = maximum;
        }
        setFirstWidth(width);
      }
    },
    [dragging, setFirstWidth, splitViewRef, minimums]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (dragging) {
        e.preventDefault();
        handleMove(e, e.clientX);
      }
    },
    [dragging, handleMove]
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
    <Flex ref={splitViewRef} {...props} width="100%">
      <FirstPane firstWidth={firstWidth} setFirstWidth={setFirstWidth}>
        {firstChild}
      </FirstPane>
      <Flex
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEndOrMouseUp}
        cursor="col-resize"
        alignSelf="stretch"
        alignItems="center"
      >
        <Box
          height="100%"
          width={`${separatorPixels}px`}
          backgroundColor="gray.125"
        />
      </Flex>
      <Box width={`calc(100% - ${firstWidth}px - ${separatorPixels}px)`}>
        {secondChild}
      </Box>
    </Flex>
  );
};

export default SplitView;
