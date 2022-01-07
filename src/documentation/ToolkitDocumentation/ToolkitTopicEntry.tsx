/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { BoxProps, Flex, Stack, Text } from "@chakra-ui/layout";
import { Collapse, useDisclosure } from "@chakra-ui/react";
import { Select } from "@chakra-ui/select";
import { ChangeEvent, useCallback, useState } from "react";
import ShowMoreButton from "../common/ShowMoreButton";
import {
  isV2Only,
  ToolkitTopic,
  ToolkitTopicEntry as ToolkitTopicEntryModel,
} from "./model";
import ToolkitContent from "./ToolkitContent";

interface ToolkitTopicEntryProps extends BoxProps {
  topic: ToolkitTopic;
  entry: ToolkitTopicEntryModel;
  active?: boolean;
}

/**
 * A toolkit topic entry. Can be displayed with and without detail.
 *
 * We show a pop-up over the code on hover to reveal the full code, overlapping
 * the sidebar scroll area.
 */
const ToolkitTopicEntry = ({
  topic,
  entry,
  active,
  ...props
}: ToolkitTopicEntryProps) => {
  // `active` prop not yet used but we can follow a similar approach to ReferenceNode.
  const { content, detailContent, alternatives, alternativesLabel } = entry;
  const hasDetail = !!detailContent;
  const [alternativeIndex, setAlternativeIndex] = useState<number | undefined>(
    alternatives && alternatives.length > 0 ? 0 : undefined
  );
  const handleSelectChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setAlternativeIndex(parseInt(e.currentTarget.value, 10));
    },
    [setAlternativeIndex]
  );
  const disclosure = useDisclosure();
  return (
    <Stack
      {...props}
      spacing={3}
      fontSize="sm"
      listStylePos="inside"
      sx={{
        "& ul": { listStyleType: "disc" },
      }}
    >
      <Text as="h3" fontSize="lg" fontWeight="semibold">
        {entry.name}
        {isV2Only(entry) ? " (V2)" : ""}
      </Text>
      <ToolkitContent content={content} />
      {alternatives && typeof alternativeIndex === "number" && (
        <>
          <Flex wrap="wrap" as="label">
            <Text alignSelf="center" mr={2} as="span">
              {alternativesLabel}
            </Text>
            <Select
              w="fit-content"
              onChange={handleSelectChange}
              value={alternativeIndex}
              size="sm"
            >
              {alternatives.map((alterative, index) => (
                <option key={alterative.name} value={index}>
                  {alterative.name}
                </option>
              ))}
            </Select>
          </Flex>

          <ToolkitContent content={alternatives[alternativeIndex].content} />
        </>
      )}
      {hasDetail && (
        <>
          {/* Avoid Stack spacing here so the margin animates too. */}
          <Collapse in={disclosure.isOpen} style={{ marginTop: 0 }}>
            <Stack spacing={3} mt={3}>
              <ToolkitContent content={detailContent} />
            </Stack>
          </Collapse>
          <ShowMoreButton
            onClick={disclosure.onToggle}
            isOpen={disclosure.isOpen}
          />
        </>
      )}
    </Stack>
  );
};

export default ToolkitTopicEntry;
