/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Icon } from "@microbit/ui";
import { RiMore2Fill } from "react-icons/ri";
import { Flex } from "styled-system/jsx";
import {
  dimensionPropName,
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
  return mode !== "open" ? null : (
    <Flex
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEndOrMouseUp}
      cursor={direction === "row" ? "col-resize" : "row-resize"}
      alignSelf="stretch"
      alignItems="center"
      zIndex="splitViewDivider"
    >
      <Flex
        height="100%"
        // Direction-dependent dimension via inline style; the perpendicular
        // dimension is the 100% height above.
        style={{ [dimensionPropName(direction)]: `${separatorPixels}px` }}
        backgroundColor="#eaecf1"
        alignItems="center"
        justifyContent="center"
        flex="1"
        boxShadow={showBoxShadow ? "md" : "none"}
      >
        <Icon
          as={RiMore2Fill}
          css={{
            color: "brand.500",
            width: "6",
            height: "6",
            transform: direction === "row" ? undefined : "rotate(90deg)",
          }}
        />
      </Flex>
    </Flex>
  );
};

export default SplitViewDivider;
