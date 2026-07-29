/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ReactNode } from "react";
import { Box } from "styled-system/jsx";
import { SystemStyleObject } from "styled-system/types";
import {
  dimensionPropName,
  separatorPixels,
  useSplitViewContext,
} from "./context";

interface SplitViewRemainderProps {
  children: ReactNode;
  css?: SystemStyleObject;
}

/**
 * The pane that takes the remaining space.
 */
const SplitViewRemainder = ({
  children,
  css: cssProp,
}: SplitViewRemainderProps) => {
  const { direction, sizedPaneSize, compactSize, mode, dragging } =
    useSplitViewContext();
  // We're the remainder, so figure out our size given the other cases.
  const remainingSpace = (() => {
    switch (mode) {
      case "collapsed":
        return "100%";
      case "open":
        return `calc(100% - ${sizedPaneSize}px - ${separatorPixels}px)`;
      case "compact":
        return `calc(100% - ${compactSize}px)`;
    }
  })();
  return (
    <Box
      // Runtime-computed dimension, not statically extractable.
      style={{ [dimensionPropName(direction)]: remainingSpace }}
      pointerEvents={dragging ? "none" : "unset"}
      css={cssProp}
    >
      {children}
    </Box>
  );
};

export default SplitViewRemainder;
