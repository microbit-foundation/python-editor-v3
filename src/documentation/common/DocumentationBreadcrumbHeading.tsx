/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button } from "@chakra-ui/button";
import { Box, Stack, Text } from "@chakra-ui/layout";
import { Collapse, HStack, VStack } from "@chakra-ui/react";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { RiArrowLeftSFill } from "react-icons/ri";
import { SimpleImage } from "../../common/sanity";
import { useScrollablePanelAncestor } from "../../common/ScrollablePanel";
import { useResizeObserverContentRect } from "../../common/use-resize-observer";
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
  const scrollable = useScrollablePanelAncestor();
  const [reduced, setReduced] = useState<boolean>(false);
  const [animating, setAnimating] = useState<boolean>(false);
  const [subtitleHeight, setSubtitleHeight] = useState<number>(0);
  const setAnimatingAsync = useCallback(async () => {
    setAnimating(true);
    await new Promise((resolve) => setTimeout(resolve, 200));
    setAnimating(false);
  }, [setAnimating]);
  const onScroll = useCallback(() => {
    if (animating) {
      return;
    }
    if (scrollable.current?.scrollTop === 0) {
      setAnimatingAsync();
      setReduced(false);
    } else if (!reduced) {
      setAnimatingAsync();
      setReduced(true);
    }
  }, [animating, reduced, scrollable, setAnimatingAsync, setReduced]);
  useEffect(() => {
    const scrollContainer = scrollable.current;
    scrollContainer?.addEventListener("scroll", onScroll);
    return () => {
      scrollContainer?.removeEventListener("scroll", onScroll);
    };
  }, [scrollable, onScroll]);
  const parentRef = useRef<HTMLDivElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const parentRect = useResizeObserverContentRect(parentRef);
  const width = parentRect?.width;
  useEffect(() => {
    setSubtitleHeight(paragraphRef.current?.clientHeight || 0);
  }, [width]);
  return (
    <Box
      p={5}
      pt={3}
      pb={reduced ? 3 : 5}
      transition="padding .2s"
      ref={parentRef}
    >
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
          {icon && (
            <DocumentationIcon
              alignSelf="flex-start"
              icon={icon}
              reduced={reduced}
            />
          )}
          <VStack align="flex-start" spacing={0}>
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
            {subtitle && (
              <Collapse
                in={!reduced}
                unmountOnExit={true}
                endingHeight={subtitleHeight}
              >
                <Text fontSize="md" pt={1} ref={paragraphRef}>
                  {subtitle}
                </Text>
              </Collapse>
            )}
          </VStack>
        </HStack>
      </Stack>
    </Box>
  );
};

export default DocumentationBreadcrumbHeading;
