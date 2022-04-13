/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button } from "@chakra-ui/button";
import { Stack, Text } from "@chakra-ui/layout";
import { HStack, VStack } from "@chakra-ui/react";
import { ReactNode } from "react";
import { RiArrowLeftSFill } from "react-icons/ri";
import { SimpleImage } from "../../common/sanity";
import DocumentationIcon from "./DocumentationIcon";
import V2Tag from "./V2Tag";

interface DocumentationBreadcrumbHeadingProps {
  title: string;
  parent: string;
  grandparent?: string;
  onBack: () => void;
  titleFontFamily?: "code";
  parentFontFamily?: "code";
  subtitle?: ReactNode;
  icon?: SimpleImage;
  isV2Only?: boolean;
}

const DocumentationBreadcrumbHeading = ({
  title,
  parent,
  grandparent,
  onBack,
  parentFontFamily,
  titleFontFamily,
  subtitle,
  icon,
  isV2Only,
}: DocumentationBreadcrumbHeadingProps) => {
  return (
    <Stack spacing={0} position="sticky">
      <Button
        // Button is full width so put content at the start.
        justifyContent="flex-start"
        leftIcon={<RiArrowLeftSFill />}
        sx={{
          span: {
            margin: 0,
          },
          svg: {
            width: "1.5rem",
            height: "1.5rem",
          },
        }}
        display="flex"
        variant="unstyled"
        onClick={onBack}
        alignItems="center"
        fontWeight="bold"
        fontSize="md"
        whiteSpace="normal"
        textAlign="left"
        color="brand.500"
      >
        <Text as="span">
          {grandparent && grandparent + " / "}
          <Text as="span" fontFamily={parentFontFamily}>
            {parent}
          </Text>
        </Text>
      </Button>
      <HStack align="center" spacing={4}>
        {icon && <DocumentationIcon alignSelf="flex-start" icon={icon} />}
        <VStack align="flex-start" spacing={1}>
          <Text
            as="h2"
            fontSize="2xl"
            fontWeight="semibold"
            fontFamily={titleFontFamily}
            display="inline-flex"
            alignItems="center"
          >
            {title} {isV2Only && <V2Tag ml={2.5} />}
          </Text>
          {subtitle && <Text fontSize="md">{subtitle}</Text>}
        </VStack>
      </HStack>
    </Stack>
  );
};

export default DocumentationBreadcrumbHeading;
