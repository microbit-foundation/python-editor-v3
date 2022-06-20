/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, Flex } from "@chakra-ui/react";
import { splitViewDivider } from "../zIndex";
import {
  dimensionProps,
  separatorPixels,
  useSplitViewContext,
} from "./context";

const SplitViewDivider = () => {
  const {
    mode,
    direction,
    handleMouseDown,
    handleTouchStart,
    handleTouchEndOrMouseUp,
  } = useSplitViewContext();
  const cursor = direction === "row" ? "col-resize" : "row-resize";
  return mode !== "open" ? null : (
    <Flex
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEndOrMouseUp}
      cursor={cursor}
      alignSelf="stretch"
      alignItems="center"
      zIndex={splitViewDivider}
    >
      <Box
        height="100%"
        {...dimensionProps(direction, `${separatorPixels}px`)}
        backgroundColor="#eaecf1"
      />
    </Flex>
  );
};

export default SplitViewDivider;
