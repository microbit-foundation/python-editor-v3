/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { BoxProps, Flex, Stack, Text } from "@chakra-ui/layout";
import { Collapse } from "@chakra-ui/react";
import { Select } from "@chakra-ui/select";
import { ChangeEvent, useCallback, useState } from "react";
import { ToolkitTopic, ToolkitTopicEntry } from "./model";
import ToolkitContent from "./ToolkitContent";
import ShowMoreButton from "../common/ShowMoreButton";

interface TopicItemProps extends BoxProps {
  topic: ToolkitTopic;
  item: ToolkitTopicEntry;
  active?: boolean;
  onForward: () => void;
  onBack: () => void;
}

/**
 * A toolkit topic item. Can be displayed without detail (for the listing)
 * or with detail for the "More info" view.
 *
 * We show a pop-up over the code on hover to reveal the full code, overlapping
 * the sidebar scroll area.
 */
const TopicItem = ({
  topic,
  item,
  active,
  onForward,
  onBack,
  ...props
}: TopicItemProps) => {
  const { content, detailContent, alternatives, alternativesLabel } = item;
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

  const [showMore, setShowMore] = useState(!!active);
  const handleShowMoreClicked = useCallback(() => {
    setShowMore(!showMore);
    if (active) {
      onBack();
    } else {
      onForward();
    }
  }, [active, onBack, onForward, showMore, setShowMore]);

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
        {item.name}
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
        <Collapse in={showMore}>
          <ToolkitContent content={detailContent} />
        </Collapse>
      )}

      {hasDetail && (
        <ShowMoreButton onClick={handleShowMoreClicked} showmore={showMore} />
      )}
    </Stack>
  );
};

export default TopicItem;
