import {
  BoxProps,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Text,
} from "@chakra-ui/react";
import { MdMoreVert } from "react-icons/md";
import { RiDeleteBin2Line, RiDownload2Line, RiEdit2Line } from "react-icons/ri";
import { FileVersion, MAIN_FILE } from "../fs/fs";
import { useProjectActions } from "../project/project-hooks";
import { isEditableFile } from "../project/project-utils";

interface FileRowProps extends BoxProps {
  projectName: string;
  value: FileVersion;
  onEdit: () => void;
}

/**
 * A row in the files area.
 */
const FileRow = ({ projectName, value, onEdit, ...props }: FileRowProps) => {
  const { name } = value;
  const isMainFile = name === MAIN_FILE;
  const actions = useProjectActions();

  return (
    <HStack {...props} justify="space-between" lineHeight={2}>
      {/* Accessibility for edit is via the row actions */}
      <Text
        component="span"
        onClick={onEdit}
        variant="unstyled"
        fontSize="md"
        fontWeight="normal"
        flexGrow={1}
        textAlign="left"
        overflowX="hidden"
        textOverflow="ellipsis"
      >
        {name}
      </Text>
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label={`${name} file actions`}
          size="md"
          variant="ghost"
          icon={<MdMoreVert />}
        />
        <Portal>
          <MenuList>
            <MenuItem
              icon={<RiEdit2Line />}
              isDisabled={!isEditableFile(name)}
              onClick={onEdit}
              aria-label={`Edit ${name}`}
            >
              Edit {name}
            </MenuItem>
            <MenuItem
              icon={<RiDownload2Line />}
              onClick={() => actions.downloadFile(name)}
              aria-label={`Download ${name}`}
            >
              Download {name}
            </MenuItem>
            <MenuItem
              icon={<RiDeleteBin2Line />}
              onClick={() => actions.deleteFile(name)}
              isDisabled={isMainFile}
              aria-label={`Delete ${name}`}
            >
              Delete {name}
            </MenuItem>
          </MenuList>
        </Portal>
      </Menu>
    </HStack>
  );
};

export default FileRow;
