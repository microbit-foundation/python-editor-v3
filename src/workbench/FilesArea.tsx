import {
  Button,
  HStack,
  IconButton,
  List,
  ListItem,
  VStack,
} from "@chakra-ui/react";
import React, { useCallback } from "react";
import { RiDeleteBinLine, RiDownload2Line } from "react-icons/ri";
import { File, MAIN_FILE } from "../fs/fs";
import { useFileSystem, useProject } from "../fs/fs-hooks";
import { saveAs } from "file-saver";
import useActionFeedback from "../common/use-action-feedback";

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
    </VStack>
  );
};

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

export default FilesArea;
