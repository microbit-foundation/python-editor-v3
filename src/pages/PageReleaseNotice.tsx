/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button, darkSurface, LinkButton, Text } from "@microbit/ui";
import { useState } from "react";
import { RiArrowRightLine, RiFeedbackLine } from "react-icons/ri";
import { styled } from "styled-system/jsx";
import FeedbackForm from "../workbench/FeedbackForm";

/**
 * The beta notice as a band under the page header, as ml-trainer shows it.
 * The editor keeps its own, shorter one at the foot of the sidebar. Both are
 * English only: they only show on non-public stages.
 */
const PageReleaseNotice = () => {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  return (
    <>
      <FeedbackForm
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
      />
      <styled.section
        display="flex"
        {...darkSurface}
        bgColor="gray.800"
        color="white"
        w="100%"
        px={{ base: 3, md: 5 }}
        py="2"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        columnGap="8"
        rowGap="2"
        flexShrink={0}
        aria-label="Release information"
        role="region"
      >
        <styled.div display="flex" alignItems="center" gap="3">
          <styled.span
            flexShrink={0}
            bg="white"
            color="brand.700"
            fontSize="xs"
            fontWeight="bold"
            textTransform="uppercase"
            letterSpacing="wide"
            px="2"
            py="0.5"
            borderRadius="md"
          >
            Beta
          </styled.span>
          <Text fontSize="sm" fontWeight="semibold">
            This is a beta version and is subject to change without notice
          </Text>
        </styled.div>
        <styled.div display="flex" alignItems="center" gap="6">
          <Button
            startIcon={<RiFeedbackLine />}
            variant="link"
            size="sm"
            css={{ color: "white", fontWeight: "bold" }}
            onPress={() => setFeedbackOpen(true)}
          >
            Feedback
          </Button>
          <LinkButton
            endIcon={<RiArrowRightLine />}
            size="sm"
            css={{
              bg: "white",
              border: 0,
              color: "brand.700",
              _hover: { bg: "white", color: "brand.700" },
            }}
            href="https://python.microbit.org/v/3"
          >
            Go to the current editor
          </LinkButton>
        </styled.div>
      </styled.section>
    </>
  );
};

export default PageReleaseNotice;
