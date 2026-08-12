/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Text } from "@microbit/ui";
import { ComponentProps } from "react";
import { Center } from "styled-system/jsx";

interface PlaceholderProps extends ComponentProps<typeof Center> {
  text?: string;
}

/**
 * A placeholder component for work-in-progress UI.
 */
const Placeholder = ({ text, ...props }: PlaceholderProps) => (
  <Center height="100%" {...props}>
    <Text p="8">{text || "Placeholder"}</Text>
  </Center>
);

export default Placeholder;
