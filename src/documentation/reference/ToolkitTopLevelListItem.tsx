/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { IconButton } from "@chakra-ui/button";
import { Box, VStack } from "@chakra-ui/layout";
import { Divider, HStack, ListItem, ListItemProps } from "@chakra-ui/react";
import { ReactNode } from "react";
import { RiArrowRightLine } from "react-icons/ri";
import { useIntl } from "react-intl";
import { ToolkitImage } from "./model";
import ToolkitIcon from "./ToolkitIcon";
import ToolkitName from "./ToolkitName";

interface ToolkitTopLevelListItemProps {
  name: string;
  description: ReactNode;
  icon?: ToolkitImage;
  isV2Only?: boolean;
  onForward: () => void;
}

const ToolkitTopLevelListItem = ({
  name,
  description,
  icon,
  isV2Only,
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
          <ToolkitName name={name} isV2Only={!!isV2Only}></ToolkitName>
          <IconButton
            icon={<RiArrowRightLine />}
            aria-label={intl.formatMessage(
              { id: "toolkit-view-documentation" },
              { name }
            )}
            size="sm"
            color="brand.200"
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

interface ToolkitListItemProps extends ListItemProps {
  showIcon: boolean;
  icon?: ToolkitImage;
}

const ToolkitListItem = ({
  children,
  showIcon,
  icon,
  ...props
}: ToolkitListItemProps) => {
  return (
    <ListItem {...props}>
      <HStack m={5} mr={3} spacing={5}>
        {showIcon && icon && <ToolkitIcon icon={icon} />}
        {children}
      </HStack>
      <Divider ml={3} borderWidth="1px" />
    </ListItem>
  );
};

export default ToolkitTopLevelListItem;