/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { List, ListItem, VStack } from "@chakra-ui/react";
import { useProject } from "../project/project-hooks";
import { isEditableFile } from "../project/project-utils";
import ScrollablePanel from "../workbench/ScrollablePanel";
import FileRow from "./FileRow";

interface FilesProps {
  selectedFile: string | undefined;
  onSelectedFileChanged: (name: string) => void;
}

/**
 * The main files area, offering access to individual files.
 */
const FilesArea = ({ selectedFile, onSelectedFileChanged }: FilesProps) => {
  const { files, name: projectName } = useProject();
  return (
    <ScrollablePanel>
      <VStack alignItems="stretch" spacing={5} height="100%" pl="5px">
        {" "}
        {/* pl to match split pane handle */}
        <List flexGrow={1}>
          {files.map((f) => {
            const select = () => {
              if (isEditableFile(f.name)) {
                onSelectedFileChanged(f.name);
              }
            };
            return (
              <ListItem
                key={f.name}
                backgroundColor={
                  selectedFile === f.name ? "gray.10" : undefined
                }
                pl={2}
                pr={1}
                cursor={isEditableFile(f.name) ? "pointer" : undefined}
                borderRadius="md"
              >
                <FileRow
                  onClick={(e) => {
                    // Clicks on buttons in the row shouldn't select the row.
                    if (e.target === e.currentTarget) {
                      select();
                    }
                  }}
                  height={12}
                  value={f}
                  projectName={projectName}
                  onEdit={select}
                />
              </ListItem>
            );
          })}
        </List>
      </VStack>
    </ScrollablePanel>
  );
};

export default FilesArea;
