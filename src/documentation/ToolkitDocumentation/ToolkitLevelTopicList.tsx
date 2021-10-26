/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { IconButton } from "@chakra-ui/button";
import { Box, List, Text } from "@chakra-ui/layout";
import { RiArrowRightSFill } from "react-icons/ri";
import { Toolkit, ToolkitNavigationState } from "./model";
import ToolkitLevel from "./ToolkitLevel";
import ToolkitListItem from "./ToolkitListItem";

interface ToolkitLevelTopicListProps {
  toolkit: Toolkit;
  onNavigate: (next: ToolkitNavigationState) => void;
}

const ToolkitLevelTopicList = ({
  toolkit: { name, description, contents },
  onNavigate,
}: ToolkitLevelTopicListProps) => {
  return (
    <ToolkitLevel
      heading={
        <>
          <Text as="h2" fontSize="3xl" fontWeight="semibold">
            {name}
          </Text>
          <Text fontSize="sm">{description}</Text>
        </>
      }
    >
      <List flex="1 1 auto" m={3}>
        {contents.map((topic) => (
          <ToolkitListItem
            key={topic.name}
            onClick={() => onNavigate({ topicId: topic.name })}
            cursor="pointer"
          >
            <Box flex="1 1 auto">
              <Text as="h3" fontSize="lg" fontWeight="semibold">
                {topic.name}
              </Text>
              {/*Content problem! We need all descriptions to be short, or two sets.*/}
              <Text fontSize="sm" noOfLines={1}>
                {topic.description}
              </Text>
            </Box>
            <IconButton
              icon={<RiArrowRightSFill />}
              aria-label="More details"
              variant="ghost"
              color="rgb(179, 186, 211)"
              fontSize="3xl"
              onClick={() => onNavigate({ topicId: topic.name })}
            />
          </ToolkitListItem>
        ))}
      </List>
    </ToolkitLevel>
  );
};

export default ToolkitLevelTopicList;
