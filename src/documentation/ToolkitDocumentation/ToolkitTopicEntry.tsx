/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { BoxProps, Flex, Stack, Text } from "@chakra-ui/layout";
import {
  Collapse,
  useDisclosure,
  usePrefersReducedMotion,
  usePrevious,
} from "@chakra-ui/react";
import { Select } from "@chakra-ui/select";
import { ChangeEvent, useCallback, useState, useEffect, useRef } from "react";
import { useLogging } from "../../logging/logging-hooks";
import { useScrollablePanelAncestor } from "../../workbench/ScrollablePanel";
import { Anchor } from "../../router-hooks";
import ShowMoreButton from "../common/ShowMoreButton";
import {
  isV2Only,
  ToolkitTopic,
  ToolkitTopicEntry as ToolkitTopicEntryModel,
} from "./model";
import ToolkitContent from "./ToolkitContent";
import Highlight from "../ToolkitDocumentation/Highlight";

interface ToolkitTopicEntryProps extends BoxProps {
  topic: ToolkitTopic;
  entry: ToolkitTopicEntryModel;
  active?: boolean;
  anchor?: Anchor;
}

/**
 * A toolkit topic entry. Can be displayed with and without detail.
 *
 * We show a pop-up over the code on hover to reveal the full code, overlapping
 * the sidebar scroll area.
 */
const ToolkitTopicEntry = ({
  anchor,
  topic,
  entry,
  active,
  ...props
}: ToolkitTopicEntryProps) => {
  const { content, detailContent, alternatives, alternativesLabel } = entry;
  const hasDetail = !!detailContent;
  const [alternativeIndex, setAlternativeIndex] = useState<number | undefined>(
    alternatives && alternatives.length > 0 ? 0 : undefined
  );
  const handleSelectChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setAlternativeIndex(parseInt(e.currentTarget.value, 10));
    },
    [setAlternativeIndex]
  );
  const disclosure = useDisclosure();
  const ref = useRef<HTMLDivElement>(null);
  const previousAnchor = usePrevious(anchor);
  const scrollable = useScrollablePanelAncestor();
  const prefersReducedMotion = usePrefersReducedMotion();
  const logging = useLogging();
  const [highlighting, setHighlighting] = useState(false);
  useEffect(() => {
    if (previousAnchor !== anchor && active) {
      logging.log("Activating " + topic.name);
      disclosure.onOpen();
      // Delay until after the opening animation so the full container height is known for the scroll.
      window.setTimeout(() => {
        if (ref.current && scrollable.current) {
          scrollable.current.scrollTo({
            // Fudge to account for the fixed header and to leave a small gap.
            top: ref.current.offsetTop - 112 - 25,
            behavior: prefersReducedMotion ? "auto" : "smooth",
          });
        }
        setTimeout(() => {
          setHighlighting(true);
          setTimeout(() => {
            setHighlighting(false);
          }, 3000);
        }, 300);
      }, 150);
    } else if (previousAnchor !== anchor) {
      if (ref.current && scrollable.current) {
        scrollable.current.scrollTo({
          top: 0,
          behavior: prefersReducedMotion ? "auto" : "smooth",
        });
      }
    }
  }, [
    anchor,
    scrollable,
    active,
    previousAnchor,
    prefersReducedMotion,
    logging,
    disclosure,
    topic,
    entry,
  ]);
  const handleHighlightClick = useCallback(() => {
    setHighlighting(false);
  }, [setHighlighting]);
  return (
    <Highlight onClick={handleHighlightClick} value={highlighting}>
      <Stack
        ref={ref}
        spacing={3}
        fontSize="sm"
        listStylePos="inside"
        p={5}
        pr={3}
        mt={1}
        mb={1}
        sx={{
          "& ul": { listStyleType: "disc" },
        }}
        {...props}
      >
        <Text as="h3" fontSize="lg" fontWeight="semibold">
          {entry.name}
          {isV2Only(entry) ? " (V2)" : ""}
        </Text>
        <ToolkitContent content={content} />
        {alternatives && typeof alternativeIndex === "number" && (
          <>
            <Flex wrap="wrap" as="label">
              <Text alignSelf="center" mr={2} as="span">
                {alternativesLabel}
              </Text>
              <Select
                w="fit-content"
                onChange={handleSelectChange}
                value={alternativeIndex}
                size="sm"
              >
                {alternatives.map((alterative, index) => (
                  <option key={alterative.name} value={index}>
                    {alterative.name}
                  </option>
                ))}
              </Select>
            </Flex>

            <ToolkitContent content={alternatives[alternativeIndex].content} />
          </>
        )}
        {hasDetail && (
          <>
            {/* Avoid Stack spacing here so the margin animates too. */}
            <Collapse in={disclosure.isOpen} style={{ marginTop: 0 }}>
              <Stack spacing={3} mt={3}>
                <ToolkitContent content={detailContent} />
              </Stack>
            </Collapse>
            <ShowMoreButton
              onClick={disclosure.onToggle}
              isOpen={disclosure.isOpen}
            />
          </>
        )}
      </Stack>
    </Highlight>
  );
};

export default ToolkitTopicEntry;
