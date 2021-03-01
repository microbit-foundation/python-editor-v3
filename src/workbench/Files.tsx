import { Button, HStack, IconButton, List, ListItem } from "@chakra-ui/react";
import React, { useCallback } from "react";
import { RiDeleteBinLine, RiDownload2Line } from "react-icons/ri";
import { File, MAIN_FILE } from "../fs/fs";
import { useFileSystem, useFileSystemState } from "../fs/fs-hooks";
import { saveAs } from "file-saver";
import useActionFeedback from "../common/use-action-feedback";

interface FilesProps {
  onSelectedFileChanged: (name: string) => void;
}

const Files = ({ onSelectedFileChanged }: FilesProps) => {
  const fs = useFileSystemState();
  if (!fs) {
    return null;
  }
  return (
    <List>
      {fs.files.map((f) => (
        <ListItem key={f.name}>
          <FileRow value={f} onClick={() => onSelectedFileChanged(f.name)} />
        </ListItem>
      ))}
    </List>
  );
};

interface FileRowProps {
  value: File;
  onClick: () => void;
}

const FileRow = ({ value, onClick }: FileRowProps) => {
  const { name } = value;
  const disabled = name === MAIN_FILE;

  const fs = useFileSystem();
  const actionFeedback = useActionFeedback();
  const handleDownload = useCallback(() => {
    try {
      const content = fs.read(name);
      const blob = new Blob([content], { type: "text/x-python" });
      saveAs(blob, name);
    } catch (e) {
      actionFeedback.unexpectedError({ error: e });
    }
  }, [fs, name]);
  const handleDelete = useCallback(() => {
    try {
      fs.remove(name);
    } catch (e) {
      actionFeedback.unexpectedError({ error: e });
    }
  }, [fs, name]);

  return (
    <HStack justify="space-between" pl={2} pr={2} lineHeight={2}>
      <Button
        onClick={onClick}
        variant="unstyled"
        aria-label={`Edit ${name}`}
        fontSize="md"
        fontWeight="normal"
        flexGrow={1}
        textAlign="left"
      >
        {name}
      </Button>
      <HStack spacing={1}>
        <IconButton
          size="sm"
          icon={<RiDeleteBinLine />}
          aria-label="Delete the file. The main Python file cannot be deleted."
          variant="ghost"
          disabled={disabled}
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

export default Files;
