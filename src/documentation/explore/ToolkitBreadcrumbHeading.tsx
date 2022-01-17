/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button } from "@chakra-ui/button";
import { Stack, Text } from "@chakra-ui/layout";
import { HStack, VStack, Image } from "@chakra-ui/react";
import { RiArrowLeftSFill } from "react-icons/ri";
import { ToolkitImage } from "./model";
import { imageUrlBuilder } from "../../common/imageUrlBuilder";

interface BreadcrumbHeadingProps {
  title: string;
  parent: string;
  grandparent?: string;
  onBack: () => void;
  titleFontFamily?: "code";
  parentFontFamily?: "code";
  subtitle?: string;
  icon?: ToolkitImage;
}

const ToolkitBreadcrumbHeading = ({
  title,
  parent,
  grandparent,
  onBack,
  parentFontFamily,
  titleFontFamily,
  subtitle,
  icon,
}: BreadcrumbHeadingProps) => {
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
      <HStack align="flex-start" spacing={4}>
        {icon && (
          <Image
            src={imageUrlBuilder.image(icon.asset).url()}
            alt=""
            width="80px"
            height="64px"
            borderRadius="lg"
            mt={1}
          />
        )}
        <VStack align="flex-start" spacing={1}>
          <Text
            as="h2"
            fontSize="2xl"
            fontWeight="semibold"
            fontFamily={titleFontFamily}
          >
            {title}
          </Text>
          {subtitle && <Text fontSize="md">{subtitle}</Text>}
        </VStack>
      </HStack>
    </Stack>
  );
};

export default ToolkitBreadcrumbHeading;
