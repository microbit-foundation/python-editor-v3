/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { BoxProps, Center, Text } from "@chakra-ui/react";

interface PlaceholderProps extends BoxProps {
  text?: string;
}

/**
 * A placeholder component for work-in-progress UI.
 */
const Placeholder = ({ text, ...props }: PlaceholderProps) => (
  <Center height="100%" {...props}>
    <Text p={8}>{text || "Placeholder"}</Text>
  </Center>
);

export default Placeholder;
