/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Box,
  Divider,
  HStack,
  List,
  ListItem,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { docStyles } from "../common/documentation-styles";
import CodeEmbed from "../documentation/common/CodeEmbed";
import DocumentationHeading from "../documentation/common/DocumentationHeading";
import Highlight from "../documentation/reference/Highlight";
import { Anchor } from "../router-hooks";
import { MethodExample, sensorMethodExamples } from "./jacdac-sensor-docs";

/**
 * Per-method example code for a Jacdac sensor type. Hardcoded, English-only
 * content (not from the CMS), but rendered with the same building blocks as the
 * Reference section (Highlight + docs-code box + DocumentationHeading + a
 * draggable CodeEmbed) so it looks and deep-links identically.
 */
interface JacdacSensorContentProps {
  topic: { id: string; name: string; description: string };
  anchor?: Anchor;
}

// The method name without its trailing "()", used to match a deep-link anchor.
const methodKey = (method: string) => method.replace(/\(\)$/, "");

const JacdacSensorContent = ({ topic, anchor }: JacdacSensorContentProps) => {
  const examples = sensorMethodExamples[topic.id] ?? [];
  const activeMethod = anchor?.id.split("/")[1];
  return (
    <List flex="1 1 auto">
      {examples.map((example) => (
        <ListItem key={example.method}>
          <JacdacMethodEntry
            topicId={topic.id}
            example={example}
            anchor={anchor}
            active={activeMethod === methodKey(example.method)}
          />
          <Divider />
        </ListItem>
      ))}
    </List>
  );
};

interface JacdacMethodEntryProps {
  topicId: string;
  example: MethodExample;
  anchor?: Anchor;
  active: boolean;
}

const JacdacMethodEntry = ({
  topicId,
  example,
  anchor,
  active,
}: JacdacMethodEntryProps) => {
  // Entries are always shown; the disclosure just satisfies Highlight's API.
  const disclosure = useDisclosure({ defaultIsOpen: true });
  return (
    <Highlight
      anchor={anchor}
      id={methodKey(example.method)}
      active={active}
      disclosure={disclosure}
    >
      <Box
        fontSize="sm"
        p={5}
        pr={3}
        mt={1}
        mb={1}
        className="docs-code"
        sx={{
          ...docStyles,
        }}
      >
        <HStack justifyContent="space-between" flexWrap="nowrap">
          <DocumentationHeading name={example.method} isV2Only={false} />
        </HStack>
        <Text mt={3} mb={3}>
          {example.description}
        </Text>
        <CodeEmbed
          code={example.code}
          toolkitType="jacdac"
          parentSlug={`${topicId}-${example.method}`}
        />
      </Box>
    </Highlight>
  );
};

export default JacdacSensorContent;
