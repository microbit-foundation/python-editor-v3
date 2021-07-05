import { createContext, useContext } from "react";

export const separatorPixels = 5;

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

export interface SplitViewContext {
  collapsed: boolean;
  sizedPaneSize: number | undefined;
  setSizedPaneSize: (v: number) => void;
  direction: Direction;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchEndOrMouseUp: () => void;
}

export const splitViewContext = createContext<SplitViewContext | null>(null);

export const useSplitViewContext = (): SplitViewContext => {
  const v = useContext(splitViewContext);
  if (!v) {
    throw new Error("Missing provider");
  }
  return v;
};
