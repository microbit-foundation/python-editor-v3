/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button, ButtonProps } from "@chakra-ui/button";
import { FormattedMessage } from "react-intl";

interface ShowMoreButtonProps extends ButtonProps {
  showmore: boolean;
}

const ShowMoreButton = ({ showmore, ...props }: ShowMoreButtonProps) => (
  <Button
    // Design is medium but we don't have 500 weight.
    fontWeight="semibold"
    fontSize="14px"
    variant="unstyled"
    size="sm"
    opacity="0.6"
    textTransform="uppercase"
    // These should be factored out if we reuse elsewhere
    pl={3}
    pr={3}
    width="max-content"
    {...props}
  >
    <FormattedMessage id={showmore ? "show-less" : "show-more"} />
  </Button>
);

export default ShowMoreButton;
