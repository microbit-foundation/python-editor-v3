import { Button, HStack, IconButton, List, ListItem } from "@chakra-ui/react";
import React from "react";
import { RiDeleteBinLine, RiDownload2Line } from "react-icons/ri";
import { File, MAIN_FILE } from "../fs/fs";
import { useFileSystemState } from "../fs/fs-hooks";

const Files = () => {
  const fs = useFileSystemState();
  if (!fs) {
    return null;
  }
  return (
    <List>
      {fs.files.map((f) => (
        <ListItem key={f.name}>
          <FileRow value={f} />
        </ListItem>
      ))}
    </List>
  );
};

interface FileRowProps {
  value: File;
}

const FileRow = ({ value }: FileRowProps) => {
  const disabled = value.name === MAIN_FILE;
  const { name } = value;
  return (
    <HStack justify="space-between" pl={2} pr={2} lineHeight={2}>
      <Button
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
        />
        <IconButton
          size="sm"
          icon={<RiDownload2Line />}
          aria-label={`Download ${name}`}
          variant="ghost"
        />
      </HStack>
    </HStack>
  );
};

export default Files;
