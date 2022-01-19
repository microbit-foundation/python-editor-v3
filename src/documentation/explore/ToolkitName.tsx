/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Text } from "@chakra-ui/layout";
import { HStack, Tag } from "@chakra-ui/react";

interface ToolkitNameProps {
  name: string;
  isV2Only: boolean;
}

const ToolkitName = ({ name, isV2Only }: ToolkitNameProps) => {
  return (
    <HStack>
      <Text as="h3" fontSize="lg" fontWeight="semibold">
        {name}
      </Text>
      {isV2Only && (
        <Tag
          fontWeight="semibold"
          background="brand.500"
          color="gray.25"
          minH="unset"
          pt="1px"
          pb="1px"
          pl={1.5}
          pr={1.5}
          borderRadius={4}
        >
          V2
        </Tag>
      )}
    </HStack>
  );
};

export default ToolkitName;
