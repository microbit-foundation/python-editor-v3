/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Link, LinkProps } from "@chakra-ui/react";
import { FormattedMessage } from "react-intl";

interface ShowMoreLinkProps extends LinkProps {
  isOpen: boolean;
}

const ShowMoreLink = ({ isOpen, ...props }: ShowMoreLinkProps) => (
  <Link {...props} color="brand.600">
    <FormattedMessage id={isOpen ? "show-less" : "show-more"} />
  </Link>
);

export default ShowMoreLink;
