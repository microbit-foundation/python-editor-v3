import { List, ListItem, VStack } from "@chakra-ui/react";
import OpenButton from "../project/OpenButton";
import { useProject } from "../project/project-hooks";
import UploadButton from "../project/UploadButton";
import FileRow from "./FileRow";

interface FilesProps {
  onSelectedFileChanged: (name: string) => void;
}

/**
 * The main files area, offering access to individual files.
 */
const FilesArea = ({ onSelectedFileChanged }: FilesProps) => {
  const { files, name: projectName } = useProject();
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
      <OpenButton variant="outline">Open a project</OpenButton>
      <UploadButton variant="outline">Upload a file</UploadButton>
    </VStack>
  );
};

export default FilesArea;
