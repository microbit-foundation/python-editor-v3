import { List, ListItem, VStack } from "@chakra-ui/react";
import OpenButton from "../project/OpenButton";
import { useProject } from "../project/project-hooks";
import FileRow from "./FileRow";

interface FilesProps {
  onSelectedFileChanged: (name: string) => void;
}

/**
 * The main files area, offering access to individual files.
 */
const FilesArea = ({ onSelectedFileChanged }: FilesProps) => {
  const { files, projectName } = useProject();
  return (
    <VStack alignItems="stretch" padding={2} spacing={5}>
      <List>
        {files.map((f) => (
          <ListItem key={f.name}>
            <FileRow
              value={f}
              projectName={projectName}
              onClick={() => onSelectedFileChanged(f.name)}
            />
          </ListItem>
        ))}
      </List>
      <OpenButton text="Open a project" variant="outline" />
    </VStack>
  );
};

export default FilesArea;
