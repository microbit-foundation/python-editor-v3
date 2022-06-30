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
  isBrief?: boolean;
}

const ShowMoreButton = ({ isOpen, isBrief, ...props }: ShowMoreLinkProps) => {
  const more = isBrief ? "more-action" : "show-more";
  const less = isBrief ? "less-action" : "show-less";
  return (
    <Link
      {...props}
      as="button"
      color="brand.600"
      textAlign="left"
      _hover={{
        textDecoration: "none",
      }}
      display="flex"
      flexWrap="nowrap"
      alignItems="center"
    >
      <FormattedMessage id={isOpen ? less : more} />
      <ExpandCollapseIcon open={isOpen} ml={1} />
    </Link>
  );
};

export default ShowMoreButton;
