/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Link, LinkProps } from "@chakra-ui/react";
import { FormattedMessage } from "react-intl";
import ExpandCollapseIcon from "../../common/ExpandCollapseIcon";

interface ShowMoreLinkProps extends LinkProps {
  isOpen: boolean;
}

const ShowMoreButton = ({ isOpen, ...props }: ShowMoreLinkProps) => (
  <Link
    {...props}
    as="button"
    color="brand.600"
    textAlign="left"
    _hover={{
      textDecoration: "none",
    }}
  >
    <FormattedMessage id={isOpen ? "show-less" : "show-more"} />
    <ExpandCollapseIcon open={isOpen} ml={1} />
  </Link>
);

export default ShowMoreButton;
