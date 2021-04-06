import { Box, Flex, FlexProps } from "@chakra-ui/layout";
import React, {
  createRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const MIN_WIDTH = 380;

interface SplitViewProps extends Omit<FlexProps, "children"> {
  children: [JSX.Element, JSX.Element];
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

export const SplitView = ({ children, ...props }: SplitViewProps) => {
  const [firstChild, secondChild] = children;
  const [firstWidth, setFirstWidth] = useState<undefined | number>(MIN_WIDTH);
  const [separatorPosition, setSeparatorPosition] = useState<
    undefined | number
  >(undefined);
  const [dragging, setDragging] = useState(false);
  const splitViewRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setSeparatorPosition(e.clientX);
      setDragging(true);
      // Avoids cursor flicker.
      splitViewRef.current!.style.cursor = "col-resize";
    },
    [setSeparatorPosition, setDragging]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      setSeparatorPosition(e.touches[0].clientX);
      setDragging(true);
    },
    [setSeparatorPosition, setDragging]
  );

  const handleMove = useCallback(
    (e: Event, clientX: number) => {
      if (dragging && firstWidth && separatorPosition) {
        const newFirstWidth = firstWidth + clientX - separatorPosition;
        setSeparatorPosition(clientX);
        if (newFirstWidth < MIN_WIDTH) {
          setFirstWidth(MIN_WIDTH);
          return;
        }
        if (splitViewRef.current) {
          const splitPaneWidth = splitViewRef.current.clientWidth;
          if (newFirstWidth > splitPaneWidth - MIN_WIDTH) {
            setFirstWidth(splitPaneWidth - MIN_WIDTH);
            return;
          }
        }
        setFirstWidth(newFirstWidth);
      }
    },
    [dragging, firstWidth, setFirstWidth, separatorPosition, splitViewRef]
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
    <Flex ref={splitViewRef} {...props}>
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
        <Box height="100%" width="5px" backgroundColor="whitesmoke" />
      </Flex>
      <Box flex="1">{secondChild}</Box>
    </Flex>
  );
};

export default SplitView;
