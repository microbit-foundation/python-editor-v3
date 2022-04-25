/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Flex, Stack, Text } from "@chakra-ui/layout";
import { Collapse, useDisclosure } from "@chakra-ui/react";
import { Select } from "@chakra-ui/select";
import { ChangeEvent, useCallback, useState } from "react";
import { docStyles } from "../../common/documentation-styles";
import { Anchor } from "../../router-hooks";
import DocumentationContent from "../common/DocumentationContent";
import DocumentationHeading from "../common/DocumentationHeading";
import { isV2Only } from "../common/model";
import ShowMoreButton from "../common/ShowMoreButton";
import Highlight from "./Highlight";
import {
  ToolkitTopic,
  ToolkitTopicEntry as ToolkitTopicEntryModel,
} from "./model";

interface ToolkitTopicEntryProps {
  topic: ToolkitTopic;
  entry: ToolkitTopicEntryModel;
  active?: boolean;
  anchor?: Anchor;
}

/**
 * A toolkit topic entry. Can be displayed with and without detail.
 *
 * We show a pop-up over the code on hover to reveal the full code, overlapping
 * the sidebar scroll area.
 */
const ReferenceTopicEntry = ({
  anchor,
  topic,
  entry,
  active,
}: ToolkitTopicEntryProps) => {
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
    <Highlight
      anchor={anchor}
      id={topic.name}
      active={active}
      disclosure={disclosure}
    >
      <Stack
        spacing={3}
        fontSize="sm"
        p={5}
        pr={3}
        mt={1}
        mb={1}
        listStylePos="inside"
        sx={{
          "& ul": { listStyleType: "disc", pl: 3 },
          ...docStyles,
        }}
      >
        <DocumentationHeading name={entry.name} isV2Only={isV2Only(entry)} />

        <DocumentationContent
          content={content}
          parentSlug={entry.slug.current}
        />
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

            <DocumentationContent
              content={alternatives[alternativeIndex].content}
              parentSlug={entry.slug.current}
            />
          </>
        )}
        {hasDetail && (
          <>
            <ShowMoreButton
              onClick={disclosure.onToggle}
              isOpen={disclosure.isOpen}
            />
            {/* Avoid Stack spacing here so the margin animates too. */}
            <Collapse in={disclosure.isOpen} style={{ marginTop: 0 }}>
              <Stack
                spacing={3}
                mt={3}
                sx={{
                  ...docStyles,
                }}
              >
                <DocumentationContent
                  content={detailContent}
                  parentSlug={entry.slug.current}
                />
              </Stack>
            </Collapse>
          </>
        )}
      </Stack>
    </Highlight>
  );
};

export default ReferenceTopicEntry;
