import { HStack, Icon, Text, VStack } from "@chakra-ui/react";
import { MdDragHandle } from "react-icons/md";
import { CodeSnippet, Package } from "./packages";

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
      backgroundColor="gray.50"
      rounded="lg"
      draggable
      pt={1}
      pb={1}
      pl={2}
      pr={2}
      align="center"
      justify="space-between"
      onDragStart={handleDragStart}
      _hover={{ cursor: "grab" }}
    >
      <VStack align="flex-start">
        <Text fontWeight="semibold">{value}</Text>
        <Text>{help}</Text>
      </VStack>
      <Icon as={MdDragHandle} transform="rotate(90deg)" />
    </HStack>
  );
};

export default DraggableCodeSnippet;
