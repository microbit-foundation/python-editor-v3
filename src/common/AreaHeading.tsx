/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Text } from "@chakra-ui/layout";

interface AreaHeadingProps {
  name: string;
  description: string;
}

const AreaHeading = ({ name, description }: AreaHeadingProps) => (
  <>
    <Text as="h2" fontSize="3xl" fontWeight="semibold">
      {name}
    </Text>
    <Text fontSize="md">{description} </Text>
  </>
);

export default AreaHeading;
