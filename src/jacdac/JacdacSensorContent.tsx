/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, Text, VStack } from "@chakra-ui/react";
import CodeEmbed from "../documentation/common/CodeEmbed";
import { sensorMethodExamples } from "./jacdac-sensor-docs";

/**
 * Info + per-method example code for a Jacdac sensor type. Hardcoded,
 * English-only content (not from the CMS). Examples are draggable/insertable
 * code blocks, reusing the documentation CodeEmbed component.
 */
interface JacdacSensorContentProps {
  topic: { id: string; name: string; description: string };
}

const JacdacSensorContent = ({ topic }: JacdacSensorContentProps) => {
  const examples = sensorMethodExamples[topic.id] ?? [];
  return (
    <VStack align="stretch" spacing={6} p={5}>
      <Text fontSize="sm">{topic.description}</Text>
      {examples.map((example) => (
        <Box key={example.method}>
          <Text fontFamily="code" fontWeight="semibold" fontSize="sm">
            {example.method}
          </Text>
          <Text fontSize="sm" color="gray.700" mb={2}>
            {example.description}
          </Text>
          <CodeEmbed
            code={example.code}
            toolkitType="jacdac"
            parentSlug={`${topic.id}-${example.method}`}
          />
        </Box>
      ))}
    </VStack>
  );
};

export default JacdacSensorContent;
