/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ChevronDownIcon, ChevronUpIcon, IconProps } from "@chakra-ui/icons";

interface ExpandCollapseIconProps extends IconProps {
  open: boolean;
}

const ExpandCollapseIcon = ({ open, ...props }: ExpandCollapseIconProps) =>
  open ? <ChevronUpIcon {...props} /> : <ChevronDownIcon {...props} />;

export default ExpandCollapseIcon;
