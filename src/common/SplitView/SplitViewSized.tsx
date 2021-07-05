import { createRef, useEffect } from "react";
import { dimensionPropName, useSplitViewContext } from "./context";
import { Box } from "@chakra-ui/layout";

interface SizedPaneProps {
  children: JSX.Element;
}

/**
 * The pane we give an explicit size to.
 *
 * The other pane takes the remaining space.
 */
const SplitViewSized = ({ children }: SizedPaneProps) => {
  const { direction, sizedPaneSize } = useSplitViewContext();
  const ref = createRef<HTMLDivElement>();
  useEffect(() => {
    if (ref.current) {
      ref.current.style[dimensionPropName(direction)] = `${sizedPaneSize}px`;
    }
  }, [ref, direction, sizedPaneSize]);
  return <Box ref={ref}>{children}</Box>;
};

export default SplitViewSized;
