/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button, ButtonProps } from "@chakra-ui/button";
import { RiArrowRightLine } from "react-icons/ri";
import { FormattedMessage } from "react-intl";

const MoreButton = (props: ButtonProps) => (
  <Button
    fontWeight="normal"
    color="brand.500"
    variant="unstyled"
    display="flex"
    size="sm"
    rightIcon={<RiArrowRightLine />}
    {...props}
  >
    <FormattedMessage id="more-action" />
  </Button>
);

export default MoreButton;
