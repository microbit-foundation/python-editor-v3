/**
 * (c) 2021-2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Tag, TagProps } from "@chakra-ui/react";

interface V2TagProps extends TagProps {}

const V2Tag = ({ ...props }: V2TagProps) => {
  return (
    <Tag
      fontWeight="semibold"
      background="brand.500"
      color="gray.25"
      minH="unset"
      pt="1px"
      pb="1px"
      pl={1.5}
      pr={1.5}
      ml={1.5}
      borderRadius={4}
      {...props}
    >
      V2
    </Tag>
  );
};

export default V2Tag;
