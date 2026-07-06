/**
 * (c) 2024, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Icon, IconProps } from "@chakra-ui/react";

const BackArrow = (props: IconProps) => (
  <Icon viewBox="0 0 22 16" {...props}>
    <path
      d="M3.82843 6.9999L22 7V9L3.82843 8.9999L9.1924 14.3638L7.7782 15.778L0 7.9999L7.7782 0.22168L9.1924 1.63589L3.82843 6.9999Z"
      fill="currentColor"
    />
  </Icon>
);

export default BackArrow;
