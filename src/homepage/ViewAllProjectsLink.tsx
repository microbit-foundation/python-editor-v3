/**
 * (c) 2024-2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Link } from "@chakra-ui/react";
import { FormattedMessage } from "react-intl";
import { Link as RouterLink } from "react-router-dom";
import { createProjectsPageUrl } from "../urls";

const ViewAllProjectsLink = () => {
  return (
    <Link
      as={RouterLink}
      to={createProjectsPageUrl()}
      color="brand.700"
      fontWeight="semibold"
      borderRadius="md"
      px={2}
      py={1}
      _focusVisible={{ boxShadow: "outline", outline: "none" }}
    >
      <FormattedMessage id="view-all-projects" />
    </Link>
  );
};

export default ViewAllProjectsLink;
