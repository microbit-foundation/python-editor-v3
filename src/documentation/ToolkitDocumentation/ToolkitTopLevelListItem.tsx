import { IconButton } from "@chakra-ui/button";
import { Box, Text } from "@chakra-ui/layout";
import { ReactNode } from "react";
import { RiArrowRightSFill } from "react-icons/ri";
import ToolkitListItem from "./ToolkitListItem";

interface ToolkitTopLevelListItemProps {
  name: string;
  description: ReactNode;
  onForward: () => void;
}

const ToolkitTopLevelListItem = ({
  name,
  description,
  onForward,
}: ToolkitTopLevelListItemProps) => (
  <ToolkitListItem onClick={onForward} cursor="pointer">
    <Box flex="1 1 auto">
      <Text as="h3" fontSize="lg" fontWeight="semibold">
        {name}
      </Text>
      {/*Content problem! We need all descriptions to be short, or two sets.*/}
      <Box fontSize="sm" noOfLines={1}>
        {description}
      </Box>
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

export default ToolkitTopLevelListItem;
