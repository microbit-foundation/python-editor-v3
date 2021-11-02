/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button } from "@chakra-ui/button";
import { HStack, Stack, Text } from "@chakra-ui/layout";
import { RiArrowLeftSFill } from "react-icons/ri";

interface BreadcrumbHeadingProps {
  title: string;
  parent: string;
  grandparent?: string;
  onBack: () => void;
  titleFontFamily?: "code";
  parentFontFamily?: "code";
}

const ToolkitBreadcrumbHeading = ({
  title,
  parent,
  grandparent,
  onBack,
  parentFontFamily,
  titleFontFamily,
}: BreadcrumbHeadingProps) => {
  return (
    <Stack spacing={0} position="sticky">
      <HStack>
        <Button
          leftIcon={<RiArrowLeftSFill color="rgb(179, 186, 211)" />}
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
          fontWeight="sm"
        >
          <Text as="span">
            {grandparent && grandparent + " / "}
            <Text as="span" fontFamily={parentFontFamily}>
              {parent}
            </Text>
          </Text>
        </Button>
      </HStack>
      <Text
        as="h2"
        fontSize="3xl"
        fontWeight="semibold"
        fontFamily={titleFontFamily}
      >
        {title}
      </Text>
    </Stack>
  );
};

export default ToolkitBreadcrumbHeading;
