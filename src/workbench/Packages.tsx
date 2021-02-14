import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Flex,
  HStack,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { RiAddLine } from "react-icons/ri";
import PackageSelectDialog from "./PackageSelectDialog";

const Packages = () => {
  const [addingPackage, setAddingPackage] = useState(false);
  return (
    <>
      <PackageSelectDialog
        isOpen={addingPackage}
        onClose={() => setAddingPackage(false)}
      />
      <Flex height="100%" direction="column" justify="space-between">
        <Accordion allowMultiple allowToggle flex="1 0 auto">
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  accelerometer
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
        <HStack as="nav" flex="0 0 auto" justifyContent="flex-end" padding={2}>
          <Button
            variant="ghost"
            onClick={() => setAddingPackage(true)}
            leftIcon={<RiAddLine />}
            size="sm"
          >
            Add package…
          </Button>
        </HStack>
      </Flex>
    </>
  );
};

export default Packages;
