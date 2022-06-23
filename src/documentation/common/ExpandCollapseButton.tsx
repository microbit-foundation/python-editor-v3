/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Link, LinkProps } from "@chakra-ui/react";
import ExpandCollapseIcon from "../../common/ExpandCollapseIcon";

interface ExpandCollapseButtonProps extends LinkProps {
  isOpen: boolean;
}

const ExpandCollapseButton = ({
  isOpen,
  ...props
}: ExpandCollapseButtonProps) => (
  <Link
    {...props}
    as="button"
    color="brand.600"
    _hover={{
      textDecoration: "none",
    }}
  >
    <ExpandCollapseIcon boxSize={8} open={isOpen} />
  </Link>
);

export default ExpandCollapseButton;
