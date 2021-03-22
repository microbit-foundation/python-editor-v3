import { Button, HStack, IconButton } from "@chakra-ui/react";
import { RiDeleteBinLine, RiDownload2Line } from "react-icons/ri";
import { MAIN_FILE } from "../fs/fs";
import { FileVersion } from "../fs/storage";
import { useProjectActions } from "../project/project-hooks";

interface FileRowProps {
  projectName: string;
  value: FileVersion;
  onClick: () => void;
}

/**
 * A row in the files area.
 */
const FileRow = ({ projectName, value, onClick }: FileRowProps) => {
  const { name } = value;
  const isMainFile = name === MAIN_FILE;
  const prettyName = isMainFile ? `${projectName} (${name})` : name;
  const actions = useProjectActions();

  return (
    <HStack justify="space-between" lineHeight={2}>
      <Button
        onClick={onClick}
        variant="unstyled"
        aria-label={`Edit ${name}`}
        fontSize="md"
        fontWeight="normal"
        flexGrow={1}
        textAlign="left"
      >
        {prettyName}
      </Button>
      <HStack spacing={1}>
        <IconButton
          size="sm"
          icon={<RiDeleteBinLine />}
          aria-label={`Delete ${name}`}
          variant="ghost"
          disabled={isMainFile}
          onClick={() => actions.deleteFile(name)}
        />
        <IconButton
          size="sm"
          icon={<RiDownload2Line />}
          aria-label={`Download ${name}`}
          variant="ghost"
          onClick={() => actions.downloadFile(name)}
        />
      </HStack>
    </HStack>
  );
};

export default FileRow;
