import React from "react";
import { Box, Center, Text } from "@chakra-ui/react";

interface PlaceholderProps {
  text?: string;
}

const Placeholder = ({ text }: PlaceholderProps) => (
  <Center height="100%">
    <Text p={8}>{text || "Placeholder"}</Text>
  </Center>
);

export default Placeholder;
