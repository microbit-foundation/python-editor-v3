/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { List, ListItem, Text } from "@microbit/ui";
import { FormattedMessage } from "react-intl";
import { Box, VStack } from "styled-system/jsx";
import FileRow from "./FileRow";
import { useProject } from "./project-hooks";
import { isEditableFile } from "./project-utils";
import ProjectAreaNav from "./ProjectAreaNav";
import ProjectNameEditable from "./ProjectNameEditable";

interface ProjectAreaProps {
  selectedFile: string | undefined;
  onSelectedFileChanged: (name: string) => void;
}

/**
 * The main files area, offering access to individual files.
 */
const ProjectArea = ({
  selectedFile,
  onSelectedFileChanged,
}: ProjectAreaProps) => {
  const { files } = useProject();
  return (
    <VStack gap="5" pt="2" flex="1 0 auto" height="0" alignItems="stretch">
      <Box flex="0 0 auto" px="5" pt="3">
        <Text fontSize="xs">
          <FormattedMessage id="project-name" />
        </Text>
        <ProjectNameEditable
          as="h2"
          fontSize="3xl"
          fontWeight="semibold"
          button="after"
          justifyContent="space-between"
          alignItems="flex-start"
          lineHeight="1.3"
          pt="0.5"
        />
      </Box>

      <List flex="1 1 auto" pl="1" pr="1.5" overflowY="auto">
        {files.map((f) => {
          const selected = selectedFile === f.name;
          const select = () => {
            if (isEditableFile(f.name)) {
              onSelectedFileChanged(f.name);
            }
          };
          return (
            <ListItem
              key={f.name}
              fontWeight={selected ? "semibold" : undefined}
              _hover={{
                bgColor: "blimpTeal.100",
              }}
              pl="2"
              pr="1"
              my="1.5"
              cursor={isEditableFile(f.name) ? "pointer" : undefined}
              borderRadius="md"
              bgColor="white"
              boxShadow="sm"
            >
              <FileRow
                onClick={(e) => {
                  // Clicks on buttons in the row shouldn't select the row.
                  if (e.target === e.currentTarget) {
                    select();
                  }
                }}
                css={{ height: "12" }}
                value={f}
                onEdit={select}
              />
            </ListItem>
          );
        })}
      </List>
      <ProjectAreaNav css={{ flex: "0 0 auto" }} />
    </VStack>
  );
};

export default ProjectArea;
