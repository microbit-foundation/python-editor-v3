/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, Code, Text, VStack } from "@chakra-ui/react";

/**
 * Info + example code for a Jacdac sensor type. Hardcoded, English-only content
 * (not from the CMS). Step 4: placeholder text/snippets — real modules and
 * snippets land in step 9 (ported from the MakeCode TypeScript).
 */
interface JacdacSensorContentProps {
  topic: { id: string; name: string; description: string };
}

// Maps a topic to its (planned) Python class name for the example snippet.
const className: Record<string, string> = {
  button: "Button",
  "rotary-button": "RotaryButton",
  slider: "Slider",
};

const JacdacSensorContent = ({ topic }: JacdacSensorContentProps) => {
  const cls = className[topic.id] ?? "Sensor";
  const varName = topic.id.replace(/-/g, "_");
  return (
    <VStack align="stretch" spacing={3} p={5} fontSize="sm">
      <Text>{topic.description}</Text>
      <Text color="gray.700">Example (placeholder):</Text>
      <Box
        as="pre"
        bg="gray.10"
        borderWidth="1px"
        borderColor="gray.200"
        borderRadius="md"
        p={3}
        overflowX="auto"
      >
        <Code bg="transparent">{`my_${varName} = Jacdac.${cls}("my role name")`}</Code>
      </Box>
    </VStack>
  );
};

export default JacdacSensorContent;
