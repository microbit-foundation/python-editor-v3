/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, Text } from "@chakra-ui/layout";
import { ReactNode } from "react";

interface AreaHeadingProps {
  name: string;
  description: ReactNode;
}

const AreaHeading = ({ name, description }: AreaHeadingProps) => (
  <Box p={5} pt={3}>
    <Text as="h2" fontSize="3xl" fontWeight="semibold">
      {name}
    </Text>
    <Text fontSize="md">{description}</Text>
  </Box>
);

export default AreaHeading;
