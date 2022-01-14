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
import { ToolkitImage } from "../ToolkitDocumentation/model";
import {
  HStack,
  Image,
  ListItemProps,
  ListItem,
  Divider,
} from "@chakra-ui/react";
import { imageUrlBuilder } from "../../common/imageUrlBuilder";

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
      <HStack ml={showIcon && icon ? 3 : 5} mr={3} mt={5} mb={5} spacing={5}>
        {showIcon && icon && (
          <Image
            src={imageUrlBuilder.image(icon.asset).url()}
            alt="Topic icon"
            width="80px"
            height="64px"
            borderRadius="lg"
            mt={1}
          />
        )}
        {children}
      </HStack>
      <Divider ml={3} borderWidth="1px" />
    </ListItem>
  );
};

export default ToolkitTopLevelListItem;
