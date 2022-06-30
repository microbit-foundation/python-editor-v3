/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, Flex, HStack, Text } from "@chakra-ui/layout";
import { useDisclosure } from "@chakra-ui/react";
import { Select } from "@chakra-ui/select";
import { ChangeEvent, useCallback, useState } from "react";
import { docStyles } from "../../common/documentation-styles";
import { PortableText } from "../../common/sanity";
import { Anchor } from "../../router-hooks";
import DocumentationContent, {
  DocumentationContextProvider,
  DocumentationCollapseMode,
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
  return (
    <DocumentationContextProvider
      parentSlug={entry.slug.current}
      toolkitType={toolkitType}
      isExpanded={disclosure.isOpen}
      title={topic.name}
    >
      <Highlight
        anchor={anchor}
        id={topic.name}
        active={active}
        disclosure={disclosure}
      >
        <Box
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
            <DocumentationHeading
              name={entry.name}
              isV2Only={isV2Only(entry)}
            />
            {hasMore && (
              <ShowMoreButton
                isBrief
                onClick={disclosure.onToggle}
                isOpen={disclosure.isOpen}
              />
            )}
          </HStack>

          <DocumentationContent
            content={content}
            details={
              hasMore
                ? DocumentationCollapseMode.ExpandCollapseExceptCodeAndFirstLine
                : DocumentationCollapseMode.ShowAll
            }
          />
          {alternatives && typeof alternativeIndex === "number" && (
            <>
              <Flex wrap="wrap" as="label" mt={3}>
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
                details={DocumentationCollapseMode.ExpandCollapseExceptCode}
                content={alternatives[alternativeIndex].content}
              />
            </>
          )}
          <DocumentationContent
            details={DocumentationCollapseMode.ExpandCollapseAll}
            content={detailContent}
          />
        </Box>
      </Highlight>
    </DocumentationContextProvider>
  );
};

const contentHasNonCode = (content: PortableText | undefined) =>
  content && content.some((x) => x._type !== "python");

const contentHasCode = (content: PortableText | undefined) =>
  content && content.some((x) => x._type === "python");

export default ReferenceTopicEntry;
