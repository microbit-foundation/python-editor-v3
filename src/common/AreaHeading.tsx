/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Text } from "@microbit/ui";
import { ReactNode } from "react";
import { Box } from "styled-system/jsx";

interface AreaHeadingProps {
  name: string;
  description: ReactNode;
  /** Rendered below the description. */
  children?: ReactNode;
}

const AreaHeading = ({ name, description, children }: AreaHeadingProps) => (
  <Box p="5" pt="3">
    <Text as="h2" fontSize="3xl" fontWeight="semibold">
      {name}
    </Text>
    <Text fontSize="md">{description}</Text>
    {children}
  </Box>
);

export default AreaHeading;
