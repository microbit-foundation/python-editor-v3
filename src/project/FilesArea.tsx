/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Flex, List, ListItem } from "@chakra-ui/react";
import { useIntl } from "react-intl";
import AreaHeading from "../common/AreaHeading";
import HeadedScrollablePanel from "../common/HeadedScrollablePanel";
import FileRow from "./FileRow";
import { useProject } from "./project-hooks";
import { isEditableFile } from "./project-utils";
import FilesAreaNav from "./FilesAreaNav";

interface FilesAreaProps {
  selectedFile: string | undefined;
  onSelectedFileChanged: (name: string) => void;
}

/**
 * The main files area, offering access to individual files.
 */
const FilesArea = ({ selectedFile, onSelectedFileChanged }: FilesAreaProps) => {
  const { files, name: projectName } = useProject();
  const intl = useIntl();
  return (
    <Flex direction="column" height="100%">
      <HeadedScrollablePanel
        heading={
          <AreaHeading
            name={intl.formatMessage({ id: "files-tab" })}
            description={intl.formatMessage({ id: "files-tab-description" })}
          />
        }
      >
        <List flex="1 1 auto" m={3}>
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
                pl={2}
                pr={1}
                my={1.5}
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
                  height={12}
                  value={f}
                  projectName={projectName}
                  onEdit={select}
                />
              </ListItem>
            );
          })}
        </List>
      </HeadedScrollablePanel>
      <FilesAreaNav flex="0 0 auto" />
    </Flex>
  );
};

export default FilesArea;
