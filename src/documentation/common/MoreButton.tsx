/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button, ButtonProps } from "@microbit/ui";
import { RiArrowRightLine } from "react-icons/ri";
import { FormattedMessage } from "react-intl";

const MoreButton = (props: ButtonProps) => (
  <Button
    variant="unstyled"
    size="sm"
    css={{ fontWeight: "normal", color: "brand.500", display: "flex" }}
    rightIcon={<RiArrowRightLine />}
    {...props}
  >
    <FormattedMessage id="more-action" />
  </Button>
);

export default MoreButton;
