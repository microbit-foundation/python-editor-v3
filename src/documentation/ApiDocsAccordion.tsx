import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  ExpandedIndex,
} from "@chakra-ui/accordion";
import { Box, Text } from "@chakra-ui/layout";
import sortBy from "lodash.sortby";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ApiDocsResponse } from "../language-server/apidocs";
import ApiDocsEntryNode from "./ApiDocsEntryNode";
import DocString from "./DocString";

interface ApiDocsAccordionProps {
  docs: ApiDocsResponse;
}

const ApiDocsAccordion = ({ docs }: ApiDocsAccordionProps) => {
  const modules = useMemo(
    () => sortBy(Object.values(docs), (m) => m.fullName),
    [docs]
  );
  const [expandedIndex, setExpandedIndex] = useState<
    ExpandedIndex | undefined
  >();
  const scrollTarget = useRef<string | undefined>();
  const scrollToId = useCallback((id: string) => {
    const elt = document.getElementById(id);
    elt?.scrollIntoView();
  }, []);
  useEffect(() => {
    const listener = (event: Event) => {
      const id = (event as CustomEvent).detail.id;
      const module = id.slice(0, id.lastIndexOf("."));
      const index = modules.findIndex((m) => m.fullName === module);
      if (index !== expandedIndex) {
        scrollTarget.current = id;
        setExpandedIndex(index);
      } else {
        scrollToId(id);
      }
    };
    document.addEventListener("cm/openDocs", listener);
    return () => {
      document.removeEventListener("cm/openDocs", listener);
    };
  }, [modules, expandedIndex, scrollToId]);
  useEffect(() => {
    if (scrollTarget.current) {
      const id = scrollTarget.current;
      scrollTarget.current = undefined;
      scrollToId(id);
    }
  });
  return (
    <>
      <Accordion
        index={expandedIndex}
        onChange={setExpandedIndex}
        allowToggle
        wordBreak="break-word"
        position="relative"
        // Animations disabled as they conflict with the sticky heading, as we animate past the sticky point.
        reduceMotion={true}
      >
        {modules.map((module) => (
          <AccordionItem key={module.id}>
            <AccordionButton
              fontSize="xl"
              backgroundColor="gray.50"
              _expanded={{
                fontWeight: "semibold",
                position: "sticky",
                top: 0,
                zIndex: 1,
              }}
              // Equivalent to the default alpha but without transparency due to the stickyness.
              _hover={{ backgroundColor: "rgb(225, 226, 226)" }}
            >
              <Box flex="1" textAlign="left" mr={3}>
                <Text as="h2">{module.fullName}</Text>
                {module.docString && <DocString value={module.docString} />}
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <ApiDocsEntryNode docs={module} heading={false} />
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  );
};

export default ApiDocsAccordion;
