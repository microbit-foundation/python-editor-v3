/**
 * (c) 2021-2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Text } from "@microbit/ui";
import { ComponentProps } from "react";
import { Flex } from "styled-system/jsx";
import V2Tag from "../common/V2Tag";

interface DocumentationHeadingProps extends ComponentProps<typeof Text> {
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
          <V2Tag />
        </Flex>
      )}
    </Text>
  );
};

export default DocumentationHeading;
