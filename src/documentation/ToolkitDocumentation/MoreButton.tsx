/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button, ButtonProps } from "@chakra-ui/button";
import { RiArrowRightLine } from "react-icons/ri";

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
    More
  </Button>
);

export default MoreButton;
