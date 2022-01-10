/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Text } from "@chakra-ui/layout";

interface ToolkitTopLevelHeadingProps {
  name: string;
  description: string;
}

const ToolkitTopLevelHeading = ({
  name,
  description,
}: ToolkitTopLevelHeadingProps) => (
  <>
    <Text as="h2" fontSize="3xl" fontWeight="semibold">
      {name}
    </Text>
    <Text fontSize="md" color="rgba(97, 97, 98, 0.7)" /*unlisted color*/>
      {description}{" "}
    </Text>
  </>
);

export default ToolkitTopLevelHeading;
