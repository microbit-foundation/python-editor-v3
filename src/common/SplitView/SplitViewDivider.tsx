/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  dimensionProps,
  separatorPixels,
  useSplitViewContext,
} from "./context";
import { Box, Flex, Fade } from "@chakra-ui/react";
import { DragHandleIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";

const SplitViewDivider = () => {
  const {
    mode,
    direction,
    handleMouseDown,
    handleTouchStart,
    handleTouchEndOrMouseUp,
    dragging,
  } = useSplitViewContext();
  const cursor = direction === "row" ? "col-resize" : "row-resize";
  const [dragHandleActive, setDragHandleActive] = useState(false);
  const [dragHandleHovered, setDragHandleHovered] = useState(false);
  const handleMouseEnter = () => {
    setDragHandleHovered(true);
    setDragHandleActive(true);
  };
  const handleMouseLeave = () => {
    setDragHandleHovered(false);
    if (!dragging) {
      setDragHandleActive(false);
    }
  };
  useEffect(() => {
    if (!dragging && !dragHandleHovered) {
      setDragHandleActive(false);
    }
  }, [dragging, dragHandleHovered]);

  return mode !== "open" ? null : direction === "row" ? (
    <Flex
      alignSelf="stretch"
      alignItems="center"
      backgroundColor="gray.10"
      justifyContent="flex-start"
      width={0}
      zIndex={1}
    >
      <Box position="absolute" height="100vh">
        <Fade in={dragHandleActive} transition={{ enter: { delay: 0.5 } }}>
          <Box width={1} height="100vh" backgroundColor="brand.300" />
        </Fade>
      </Box>
      <Box pl={2}>
        <DragHandleIcon
          boxSize={4}
          color="gray.200"
          cursor={cursor}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEndOrMouseUp}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      </Box>
    </Flex>
  ) : (
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
  );
};

export default SplitViewDivider;
