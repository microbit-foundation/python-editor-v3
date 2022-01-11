/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { IconButton } from "@chakra-ui/button";
import { Box, Text, VStack } from "@chakra-ui/layout";
import { ReactNode } from "react";
import { RiArrowRightLine } from "react-icons/ri";
import { useIntl } from "react-intl";
import ToolkitListItem from "./ToolkitListItem";
import { ToolkitImage } from "../ToolkitDocumentation/model";
import { HStack } from "@chakra-ui/react";

interface ToolkitTopLevelListItemProps {
  name: string;
  description: ReactNode;
  icon?: ToolkitImage;
  onForward: () => void;
}

const ToolkitTopLevelListItem = ({
  name,
  description,
  icon,
  onForward,
}: ToolkitTopLevelListItemProps) => {
  const intl = useIntl();
  return (
    <ToolkitListItem
      onClick={onForward}
      cursor="pointer"
      showIcon={true}
      icon={icon}
    >
      <VStack alignItems="stretch" spacing={1} flex="1 1 auto">
        <HStack justifyContent="space-between">
          <Text as="h3" fontSize="lg" fontWeight="semibold">
            {name}
          </Text>
          <IconButton
            icon={<RiArrowRightLine />}
            aria-label={intl.formatMessage(
              { id: "toolkit-view-documentation" },
              { name }
            )}
            size="sm"
            color="#8972CB" //not in theme
            variant="ghost"
            fontSize="2xl"
            onClick={onForward}
          />
        </HStack>
        {/*Content problem! We need all descriptions to be short, or two sets.*/}
        <Box fontSize="sm" noOfLines={1}>
          {description}
        </Box>
      </VStack>
    </ToolkitListItem>
  );
};

export default ToolkitTopLevelListItem;
