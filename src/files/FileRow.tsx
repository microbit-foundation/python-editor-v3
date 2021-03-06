import { Button, HStack, IconButton } from "@chakra-ui/react";
import { useCallback } from "react";
import { RiDeleteBinLine, RiDownload2Line } from "react-icons/ri";
import useActionFeedback from "../common/use-action-feedback";
import { File, MAIN_FILE } from "../fs/fs";
import { useFileSystem } from "../fs/fs-hooks";

interface FileRowProps {
  projectName: string;
  value: File;
  onClick: () => void;
}

const FileRow = ({ projectName, value, onClick }: FileRowProps) => {
  const { name } = value;
  const isMainFile = name === MAIN_FILE;
  const prettyName = isMainFile ? `${projectName} (${name})` : name;
  const downloadName = isMainFile ? `${projectName}.py` : name;

  const fs = useFileSystem();
  const actionFeedback = useActionFeedback();
  const handleDownload = useCallback(() => {
    try {
      const content = fs.read(name);
      const blob = new Blob([content], { type: "text/x-python" });
      saveAs(blob, downloadName);
    } catch (e) {
      actionFeedback.unexpectedError(e);
    }
  }, [fs, name]);

  const handleDelete = useCallback(() => {
    try {
      fs.remove(name);
    } catch (e) {
      actionFeedback.unexpectedError(e);
    }
  }, [fs, name]);

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
          aria-label="Delete the file. The main Python file cannot be deleted."
          variant="ghost"
          disabled={isMainFile}
          onClick={handleDelete}
        />
        <IconButton
          size="sm"
          icon={<RiDownload2Line />}
          aria-label={`Download ${name}`}
          variant="ghost"
          onClick={handleDownload}
        />
      </HStack>
    </HStack>
  );
};

export default FileRow;
