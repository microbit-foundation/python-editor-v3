/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { SplitViewSplitter as UiSplitViewSplitter } from "@microbit/ui";

interface SplitViewSplitterProps {
  "aria-label": string;
  showBoxShadow?: boolean;
}

/**
 * The @microbit/ui splitter with this app's look.
 */
const SplitViewSplitter = ({
  showBoxShadow = false,
  ...props
}: SplitViewSplitterProps) => (
  <UiSplitViewSplitter
    {...props}
    css={{
      bg: "#eaecf1",
      color: "brand.500",
      zIndex: "splitViewDivider",
      boxShadow: showBoxShadow ? "md" : "none",
      // Px rather than the recipe's spacing token, which the dense preset
      // scales.
      "&[data-orientation=vertical]": { width: "10px" },
      "&[data-orientation=horizontal]": { height: "10px" },
      _hover: { bg: "gray.100" },
      _active: { bg: "gray.200" },
    }}
  />
);

export default SplitViewSplitter;
