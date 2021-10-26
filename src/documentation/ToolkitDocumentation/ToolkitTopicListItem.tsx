import { IconButton } from "@chakra-ui/button";
import { Box, Text } from "@chakra-ui/layout";
import { RiArrowRightSFill } from "react-icons/ri";
import { ToolkitTopic } from "./model";
import ToolkitListItem from "./ToolkitListItem";

interface ToolkitTopicListItemProps {
  topic: ToolkitTopic;
  onForward: () => void;
}

const ToolkitTopicListItem = ({
  topic,
  onForward,
}: ToolkitTopicListItemProps) => (
  <ToolkitListItem key={topic.name} onClick={onForward} cursor="pointer">
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
      onClick={onForward}
    />
  </ToolkitListItem>
);

export default ToolkitTopicListItem;
