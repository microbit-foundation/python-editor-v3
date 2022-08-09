/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Flex, Icon } from "@chakra-ui/react";
import { RiMore2Fill } from "react-icons/ri";
import { splitViewDivider } from "../zIndex";
import {
  dimensionProps,
  separatorPixels,
  useSplitViewContext,
} from "./context";

interface SplitViewDividerProps {
  showBoxShadow?: boolean;
}

const SplitViewDivider = ({ showBoxShadow = false }: SplitViewDividerProps) => {
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
      <Flex
        height="100%"
        {...dimensionProps(direction, `${separatorPixels}px`)}
        backgroundColor="#eaecf1"
        alignItems="center"
        justifyContent="center"
        flex={1}
        boxShadow={showBoxShadow ? "md" : "none"}
      >
        <Icon
          as={RiMore2Fill}
          color="brand.500"
          h={6}
          w={6}
          transform={direction === "row" ? "" : "rotate(90deg)"}
        />
      </Flex>
    </Flex>
  );
};

export default SplitViewDivider;
