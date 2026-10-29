/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { createContext, use } from "react";
import { SizedMode } from "./SplitView";

export const separatorPixels = 10;

/**
 * The simple subset of flex direction.
 */
export type Direction = "row" | "column";

export const dimensionPropName = (direction: Direction) =>
  direction === "column" ? "height" : "width";

export const dimensionProps = (
  direction: Direction,
  value: number | string
) => {
  return {
    [dimensionPropName(direction)]: value,
  };
};

export interface SplitViewContextValue {
  dragging: boolean;
  mode: SizedMode;
  compactSize: number;
  sizedPaneSize: number | undefined;
  setSizedPaneSize: (v: number) => void;
  direction: Direction;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchEndOrMouseUp: () => void;
}

export const SplitViewContext = createContext<SplitViewContextValue | null>(
  null
);

export const useSplitViewContext = (): SplitViewContextValue => {
  const v = use(SplitViewContext);
  if (!v) {
    throw new Error("Missing provider");
  }
  return v;
};
