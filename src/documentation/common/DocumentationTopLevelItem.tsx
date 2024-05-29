/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { IconButton } from "@chakra-ui/button";
import { Box, VStack } from "@chakra-ui/layout";
import {
  Divider,
  HStack,
  ListItem,
  ListItemProps,
  useMediaQuery,
} from "@chakra-ui/react";
import { ReactNode } from "react";
import { RiArrowRightLine } from "react-icons/ri";
import { useIntl } from "react-intl";
import { SimpleImage } from "../../common/sanity";
import DocumentationIcon from "./DocumentationIcon";
import DocumentationHeading from "./DocumentationHeading";
import { heightMd, widthXl } from "../../common/media-queries";

type DocType = "reference" | "api";

interface DocumentationTopLevelItemProps {
  name: string;
  description: ReactNode;
  icon?: SimpleImage;
  isV2Only?: boolean;
  onForward: () => void;
  spacing?: number;
  type: DocType;
}

const DocumentationTopLevelItem = ({
  name,
  description,
  icon,
  isV2Only,
  onForward,
  type,
}: DocumentationTopLevelItemProps) => {
  const intl = useIntl();
  const [isShortWindow] = useMediaQuery(heightMd, { ssr: false });
  const [isWideScreen] = useMediaQuery(widthXl, { ssr: false });
  return (
    <DocumentationListItem
      onClick={onForward}
      cursor="pointer"
      showIcon={true}
      icon={icon}
      type={type}
    >
      <VStack
        alignItems="stretch"
        spacing={isShortWindow || !isWideScreen ? 0 : 1}
        flex="1 1 auto"
      >
        <HStack justifyContent="space-between">
          <DocumentationHeading name={name} isV2Only={!!isV2Only} />
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
          />
        </HStack>
        {/*Content problem! We need all descriptions to be short, or two sets.*/}
        <Box fontSize="sm" noOfLines={1}>
          {description}
        </Box>
      </VStack>
    </DocumentationListItem>
  );
};

interface DocumentationListItemProps extends ListItemProps {
  showIcon: boolean;
  icon?: SimpleImage;
  type: DocType;
}

const DocumentationListItem = ({
  children,
  showIcon,
  icon,
  type,
  ...props
}: DocumentationListItemProps) => {
  const [isShortWindow] = useMediaQuery(heightMd, { ssr: false });
  const [isWideScreen] = useMediaQuery(widthXl, { ssr: false });
  const my =
    type === "reference"
      ? isShortWindow || !isWideScreen
        ? 2
        : 5
      : isShortWindow || !isWideScreen
      ? 3
      : 5;
  return (
    <ListItem {...props}>
      <HStack
        my={my}
        mr={3}
        ml={type === "reference" ? (isShortWindow || !isWideScreen ? 3 : 5) : 5}
        spacing={isShortWindow || !isWideScreen ? 3 : 5}
      >
        {showIcon && icon && <DocumentationIcon icon={icon} reduced={false} />}
        {children}
      </HStack>
      <Divider ml={3} borderWidth="1px" />
    </ListItem>
  );
};

export default DocumentationTopLevelItem;
