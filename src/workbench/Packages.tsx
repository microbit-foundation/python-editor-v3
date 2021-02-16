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
  Icon,
  List,
  ListItem,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { RiAddLine } from "react-icons/ri";
import { MdDragHandle } from "react-icons/md";
import PackageSelectDialog from "./PackageSelectDialog";

interface CodeSnippet {
  value: string;
  help: string;
}

interface Package {
  name: string;
  snippets: CodeSnippet[];
}

const packages: Package[] = [
  {
    name: "accelerometer",
    snippets: [
      {
        value: "get_x()",
        help: "Get the acceleration measurement in the x axis",
      },
      {
        value: "get_y()",
        help: "Get the acceleration measurement in the y axis",
      },
      {
        value: "get_z()",
        help: "Get the acceleration measurement in the z axis",
      },
    ],
  },
];

const Packages = () => {
  const [addingPackage, setAddingPackage] = useState(false);
  return (
    <>
      <PackageSelectDialog
        isOpen={addingPackage}
        onClose={() => setAddingPackage(false)}
      />
      {/* This needs to be scrollable so we need to switch to a vh height or measure it and set a pixel height */}
      <Flex height="100%" direction="column" justify="space-between">
        <Accordion allowMultiple allowToggle flex="1 0 auto">
          {[...packages].map((pkg) => (
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box textAlign="left">{pkg.name}</Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <List marginLeft={4}>
                  {pkg.snippets.map((snippet) => (
                    <ListItem mt={2}>
                      <DraggableCodeSnippet pkg={pkg} value={snippet} />
                    </ListItem>
                  ))}
                </List>
              </AccordionPanel>
            </AccordionItem>
          ))}
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

interface DraggableCodeSnippetProps {
  pkg: Package;
  value: CodeSnippet;
}

const DraggableCodeSnippet = ({
  pkg,
  value: { value, help },
}: DraggableCodeSnippetProps) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    // We probably want to set some other content type that we can handle
    // specially inside the editor.
    e.dataTransfer.setData("text", `${pkg.name}.${value}`);
  };
  return (
    <HStack
      backgroundColor="whitesmoke"
      rounded={5}
      draggable
      padding={1}
      align="center"
      justify="space-between"
      onDragStart={handleDragStart}
    >
      <VStack align="flex-start">
        <Text>{value}</Text>
        <Text>{help}</Text>
      </VStack>
      <Icon as={MdDragHandle} transform="rotate(90deg)" />
    </HStack>
  );
};

export default Packages;
