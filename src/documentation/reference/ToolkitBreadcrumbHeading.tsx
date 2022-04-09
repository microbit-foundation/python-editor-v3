/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button } from "@chakra-ui/button";
import { Stack, Text } from "@chakra-ui/layout";
import { HStack, Image, VStack } from "@chakra-ui/react";
import { ReactNode } from "react";
import { RiArrowLeftSFill } from "react-icons/ri";
import { getAspectRatio, imageUrlBuilder } from "../../common/imageUrlBuilder";
import { IdeaImage } from "../ideas/model";
import { ToolkitImage } from "./model";
import ToolkitIcon from "./ToolkitIcon";

interface BreadcrumbHeadingProps {
  title: string;
  parent: string;
  grandparent?: string;
  onBack: () => void;
  titleFontFamily?: "code";
  parentFontFamily?: "code";
  subtitle?: ReactNode;
  icon?: ToolkitImage;
  image?: IdeaImage;
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
  image,
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
      <HStack align="center" spacing={4}>
        {icon && <ToolkitIcon alignSelf="flex-start" icon={icon} />}
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
          {image && (
            <Image
              src={imageUrlBuilder
                .image(image.asset)
                .width(300)
                .fit("max")
                .url()}
              alt=""
              width={300}
              sx={{ aspectRatio: getAspectRatio(image.asset._ref) }}
            />
          )}
        </VStack>
      </HStack>
    </Stack>
  );
};

export default ToolkitBreadcrumbHeading;
