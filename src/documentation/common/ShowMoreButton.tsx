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
    fontWeight="normal"
    color="#262626"
    variant="unstyled"
    display="inline-flex"
    justifyContent="flex-start"
    size="sm"
    opacity="0.6"
    letterSpacing="0px"
    p="0 12px"
    textTransform="uppercase"
    width="max-content"
    {...props}
  >
    <FormattedMessage id={showmore ? "show-less" : "show-more"} />
  </Button>
);

export default ShowMoreButton;
