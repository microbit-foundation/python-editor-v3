/**
 * (c) 2021-2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Text, TextProps } from "@chakra-ui/layout";
import { Flex, Tag } from "@chakra-ui/react";

interface DocumentationHeadingProps extends TextProps {
  name: string;
  isV2Only: boolean;
}

const DocumentationHeading = ({
  name,
  isV2Only,
  ...props
}: DocumentationHeadingProps) => {
  return (
    <Text as="h3" fontSize="lg" fontWeight="semibold" {...props}>
      {name}
      {isV2Only && (
        <Flex display="inline-flex">
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
          >
            V2
          </Tag>
        </Flex>
      )}
    </Text>
  );
};

export default DocumentationHeading;
