/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, Flex, HStack, Text } from "@chakra-ui/layout";
import { useDisclosure } from "@chakra-ui/react";
import { Select } from "@chakra-ui/select";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { docStyles } from "../../common/documentation-styles";
import { PortableText } from "../../common/sanity";
import { Anchor } from "../../router-hooks";
import DocumentationContent, {
  DocumentationCollapseMode,
  DocumentationContextProvider,
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
  alternative?: string;
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
  const activeAlterative = anchor?.id.split("/")[1];
  const [alternativeSlug, setAlternativeSlug] = useState<string | undefined>(
    alternatives && alternatives.length > 0
      ? activeAlterative && active
        ? activeAlterative
        : alternatives[0].slug.current
      : undefined
  );
  const activeAlterativeContent = alternatives?.find(
    (a) => a.slug.current === alternativeSlug
  )?.content;

  useEffect(() => {
    if (activeAlterative && active) {
      setAlternativeSlug(activeAlterative);
    }
  }, [active, activeAlterative]);

  const hasCode =
    contentHasCode(content) ||
    (alternatives && contentHasCode(activeAlterativeContent));

  const hasMore =
    hasCode &&
    (detailContent ||
      contentHasSomeNonCode(content) ||
      (alternatives && contentHasSomeNonCode(activeAlterativeContent)));

  const handleSelectChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setAlternativeSlug(e.currentTarget.value);
    },
    [setAlternativeSlug]
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
          className="docs-code"
          sx={{
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
          {alternatives && typeof alternativeSlug === "string" && (
            <>
              <Flex wrap="wrap" as="label" mt={3}>
                <Text alignSelf="center" mr={2} as="span">
                  {alternativesLabel}
                </Text>
                <Select
                  w="fit-content"
                  onChange={handleSelectChange}
                  value={alternativeSlug}
                  size="sm"
                >
                  {alternatives.map((alterative) => (
                    <option
                      key={alterative.slug.current}
                      value={alterative.slug.current}
                    >
                      {alterative.name}
                    </option>
                  ))}
                </Select>
              </Flex>

              <DocumentationContent
                details={DocumentationCollapseMode.ExpandCollapseExceptCode}
                content={activeAlterativeContent}
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

const contentHasSomeNonCode = (content: PortableText | undefined) =>
  content && content.some((x) => x._type !== "python");

const contentHasCode = (content: PortableText | undefined) =>
  content && content.some((x) => x._type === "python");

export default ReferenceTopicEntry;
