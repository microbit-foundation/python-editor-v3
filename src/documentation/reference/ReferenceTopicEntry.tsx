/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Flex, HStack, Stack, Text } from "@chakra-ui/layout";
import { Collapse, useDisclosure } from "@chakra-ui/react";
import { Select } from "@chakra-ui/select";
import { ChangeEvent, useCallback, useState } from "react";
import { docStyles } from "../../common/documentation-styles";
import { PortableText, toFirstBlockIfBlock } from "../../common/sanity";
import { Anchor } from "../../router-hooks";
import DocumentationContent, {
  DocumentationDetails,
} from "../common/DocumentationContent";
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

  const [alternativeIndex, setAlternativeIndex] = useState<number | undefined>(
    alternatives && alternatives.length > 0 ? 0 : undefined
  );

  const hasCode =
    contentHasCode(content) ||
    (alternatives &&
      contentHasCode(alternatives[alternativeIndex as number].content));

  const hasMore =
    hasCode &&
    (detailContent ||
      contentHasNonCode(content) ||
      (alternatives &&
        contentHasNonCode(alternatives[alternativeIndex as number].content)));

  const handleSelectChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setAlternativeIndex(parseInt(e.currentTarget.value, 10));
    },
    [setAlternativeIndex]
  );
  const disclosure = useDisclosure();
  const toolkitType = "reference";
  const firstContentBlock = toFirstBlockIfBlock(content);
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
        className="docs-code"
        sx={{
          "& ul": { listStyleType: "disc", pl: 3 },
          ...docStyles,
        }}
      >
        <HStack justifyContent="space-between" flexWrap="nowrap">
          <DocumentationHeading name={entry.name} isV2Only={isV2Only(entry)} />
          {hasMore && (
            <ShowMoreButton
              isBrief
              onClick={disclosure.onToggle}
              isOpen={disclosure.isOpen}
            />
          )}
        </HStack>

        {hasMore && !disclosure.isOpen && firstContentBlock.length > 0 && (
          <Text noOfLines={1} as="div">
            <DocumentationContent
              content={firstContentBlock}
              parentSlug={entry.slug.current}
              toolkitType={toolkitType}
            />
          </Text>
        )}
        <DocumentationContent
          content={content}
          details={DocumentationDetails.ExpandCollapse}
          isExpanded={!hasMore || disclosure.isOpen}
          parentSlug={entry.slug.current}
          toolkitType={toolkitType}
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
              details={DocumentationDetails.ExpandCollapse}
              isExpanded={disclosure.isOpen}
              content={alternatives[alternativeIndex].content}
              parentSlug={entry.slug.current}
              toolkitType={toolkitType}
            />
          </>
        )}
        {detailContent && (
          <Collapse in={disclosure.isOpen} style={{ marginTop: 0 }}>
            <Stack spacing={3} mt={3}>
              <DocumentationContent
                content={detailContent}
                parentSlug={entry.slug.current}
                toolkitType={toolkitType}
              />
            </Stack>
          </Collapse>
        )}
      </Stack>
    </Highlight>
  );
};

const contentHasNonCode = (content: PortableText | undefined) =>
  content && content.some((x) => x._type !== "python");

const contentHasCode = (content: PortableText | undefined) =>
  content && content.some((x) => x._type === "python");

export default ReferenceTopicEntry;
