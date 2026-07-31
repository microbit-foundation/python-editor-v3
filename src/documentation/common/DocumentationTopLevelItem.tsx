/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Divider, IconButton, ListItem, useMediaQuery } from "@microbit/ui";
import { MouseEventHandler, ReactNode } from "react";
import { RiArrowRightLine } from "react-icons/ri";
import { useIntl } from "react-intl";
import { Box, HStack, VStack } from "styled-system/jsx";
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
  const isShortWindow = useMediaQuery(heightMd);
  const isWideScreen = useMediaQuery(widthXl);
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
        gap={isShortWindow || !isWideScreen ? "0" : "1"}
        flex="1 1 auto"
      >
        <HStack justifyContent="space-between">
          <DocumentationHeading name={name} isV2Only={!!isV2Only} />
          <IconButton
            aria-label={intl.formatMessage(
              { id: "toolkit-view-documentation" },
              { name }
            )}
            size="sm"
            css={{ color: "brand.200", fontSize: "2xl" }}
            variant="ghost"
            // The Chakra button relied on its click bubbling to the list
            // item's onClick; react-aria's press handling suppresses that.
            onPress={onForward}
          >
            <RiArrowRightLine />
          </IconButton>
        </HStack>
        {/*Content problem! We need all descriptions to be short, or two sets.*/}
        <Box fontSize="sm" lineClamp="1">
          {description}
        </Box>
      </VStack>
    </DocumentationListItem>
  );
};

interface DocumentationListItemProps {
  children: ReactNode;
  showIcon: boolean;
  icon?: SimpleImage;
  type: DocType;
  onClick?: MouseEventHandler<HTMLLIElement>;
  cursor?: string;
}

const DocumentationListItem = ({
  children,
  showIcon,
  icon,
  type,
  onClick,
}: DocumentationListItemProps) => {
  const isShortWindow = useMediaQuery(heightMd);
  const isWideScreen = useMediaQuery(widthXl);
  const reducedSpace = isShortWindow || !isWideScreen;
  return (
    <ListItem onClick={onClick} cursor="pointer">
      <HStack
        my={
          type === "reference"
            ? reducedSpace
              ? "2"
              : "5"
            : reducedSpace
            ? "3"
            : "5"
        }
        mr="3"
        ml={type === "reference" ? (reducedSpace ? "3" : "5") : "5"}
        gap={reducedSpace ? "3" : "5"}
      >
        {showIcon && icon && <DocumentationIcon icon={icon} reduced={false} />}
        {children}
      </HStack>
      <Divider ml="3" thickness="thick" />
    </ListItem>
  );
};

export default DocumentationTopLevelItem;
