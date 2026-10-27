/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button, darkSurface, Text } from "@microbit/ui";
import { useState } from "react";
import { RiFeedbackFill } from "react-icons/ri";
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
        px="3"
        py="1"
        justifyContent="center"
        alignItems="center"
        gap="8"
        flexShrink={0}
        aria-label="Release information"
        role="region"
      >
        <Text fontSize="sm" textAlign="center" fontWeight="semibold" p="1">
          This is a beta version and is subject to change without notice
        </Text>
        <Button
          startIcon={<RiFeedbackFill />}
          variant="link"
          size="xs"
          css={{ color: "white", fontWeight: "bold", p: "1" }}
          onPress={() => setFeedbackOpen(true)}
        >
          Feedback
        </Button>
      </styled.section>
    </>
  );
};

export default PageReleaseNotice;
