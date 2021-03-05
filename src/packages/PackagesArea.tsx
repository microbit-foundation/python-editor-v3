import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  HStack,
  Icon,
  List,
  ListItem,
  Text,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { MdDragHandle } from "react-icons/md";
import DraggableCodeSnippet from "./DraggableCodeSnippet";
import { packages } from "./packages";

/**
 * The packages section showing available API.
 *
 * This is just illustrative of what we want in this area.
 */
const PackagesArea = () => {
  return (
    <Flex height="100%" direction="column" justify="space-between">
      <Accordion
        height={0}
        flex="1 1 auto"
        allowMultiple
        allowToggle
        overflowY="auto"
      >
        {packages.map((pkg) => (
          <AccordionItem key={pkg.name}>
            <h2>
              <AccordionButton>
                <Box textAlign="left" fontWeight="semibold">
                  {pkg.name}
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <List marginLeft={4}>
                {pkg.snippets.map((snippet) => (
                  <ListItem mb={2} key={snippet.value}>
                    <DraggableCodeSnippet pkg={pkg} value={snippet} />
                  </ListItem>
                ))}
              </List>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Flex>
  );
};

export default PackagesArea;
