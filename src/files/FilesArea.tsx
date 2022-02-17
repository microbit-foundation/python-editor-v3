/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { List, ListItem } from "@chakra-ui/react";
import { useIntl } from "react-intl";
import AreaHeading from "../common/AreaHeading";
import HeadedScrollablePanel from "../common/HeadedScrollablePanel";
import { useProject } from "../project/project-hooks";
import { isEditableFile } from "../project/project-utils";
import FileRow from "./FileRow";
import FilesAreaNav from "./FilesAreaNav";

interface FilesProps {
  selectedFile: string | undefined;
  onSelectedFileChanged: (name: string) => void;
}

/**
 * The main files area, offering access to individual files.
 */
const FilesArea = ({ selectedFile, onSelectedFileChanged }: FilesProps) => {
  const { files, name: projectName } = useProject();
  const intl = useIntl();
  return (
    <HeadedScrollablePanel
      heading={
        <AreaHeading
          name={intl.formatMessage({ id: "files-tab" })}
          description={intl.formatMessage({ id: "files-tab-description" })}
        />
      }
    >
      <List flexGrow={1} pl={1} pr={1.5} py={2}>
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
      <FilesAreaNav mt={8} />
    </HeadedScrollablePanel>
  );
};

export default FilesArea;
