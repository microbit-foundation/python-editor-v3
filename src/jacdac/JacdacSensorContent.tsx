/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, Text, VStack } from "@chakra-ui/react";

/**
 * Info + example code for a Jacdac sensor type. Hardcoded, English-only content
 * (not from the CMS). Examples use the polling `Jacdac` module (see
 * src/jacdac/python/Jacdac.py) in a `while True` loop.
 */
interface JacdacSensorContentProps {
  topic: { id: string; name: string; description: string };
}

const snippets: Record<string, string> = {
  button: `my_button = Jacdac.Button("my role name")
while True:
    if my_button.was_pressed():
        display.show(Image.HAPPY)`,
  "rotary-encoder": `my_dial = Jacdac.RotaryEncoder("my role name")
while True:
    display.scroll(my_dial.value())`,
  slider: `my_slider = Jacdac.Slider("my role name")
while True:
    display.show(str(my_slider.value()))`,
};

const JacdacSensorContent = ({ topic }: JacdacSensorContentProps) => {
  const snippet = snippets[topic.id];
  return (
    <VStack align="stretch" spacing={3} p={5} fontSize="sm">
      <Text>{topic.description}</Text>
      {snippet && (
        <>
          <Text color="gray.700">Example:</Text>
          <Box
            as="pre"
            bg="gray.10"
            borderWidth="1px"
            borderColor="gray.200"
            borderRadius="md"
            p={3}
            overflowX="auto"
            fontFamily="code"
            whiteSpace="pre"
          >
            {snippet}
          </Box>
        </>
      )}
    </VStack>
  );
};

export default JacdacSensorContent;
