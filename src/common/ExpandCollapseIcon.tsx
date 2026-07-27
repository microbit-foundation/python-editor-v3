/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Icon, IconProps } from "@microbit/ui";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

interface ExpandCollapseIconProps extends Omit<IconProps, "as"> {
  open: boolean;
}

// The Material arrow glyphs are the same paths as the Chakra chevron icons
// this replaced.
const ExpandCollapseIcon = ({ open, ...props }: ExpandCollapseIconProps) =>
  open ? (
    <Icon as={MdKeyboardArrowUp} {...props} />
  ) : (
    <Icon as={MdKeyboardArrowDown} {...props} />
  );

export default ExpandCollapseIcon;
