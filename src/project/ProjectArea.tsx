/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { List, ListItem, Stack, Text } from "@chakra-ui/react";
import { FormattedMessage } from "react-intl";
import HeadedScrollablePanel from "../common/HeadedScrollablePanel";
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
  const { files, name: projectName } = useProject();
  return (
    <HeadedScrollablePanel
      heading={
        <>
          <Text fontSize="xs">
            <FormattedMessage id="project-name" />
          </Text>
          <ProjectNameEditable
            as="h2"
            fontSize="3xl"
            fontWeight="semibold"
            color="grey.800"
            button="after"
            justifyContent="space-between"
            alignItems="flex-start"
            lineHeight="1.3"
            pt={0.5}
          />
        </>
      }
    >
      <Stack spacing={5} pt={2}>
        <List flexGrow={1} pl={1} pr={1.5}>
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
        <ProjectAreaNav />
      </Stack>
    </HeadedScrollablePanel>
  );
};

export default ProjectArea;
