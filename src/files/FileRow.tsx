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
import { useIntl } from "react-intl";
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
  const intl = useIntl();
  const editFile = intl.formatMessage({ id: "edit-file" }, { name });
  const deleteFile = intl.formatMessage({ id: "delete-file" }, { name });
  const downloadFile = intl.formatMessage({ id: "download-file" }, { name });

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
          aria-label={intl.formatMessage({ id: "file-actions" }, { name })}
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
              aria-label={editFile}
            >
              {editFile}
            </MenuItem>
            <MenuItem
              icon={<RiDownload2Line />}
              onClick={() => actions.downloadFile(name)}
              aria-label={downloadFile}
            >
              {downloadFile}
            </MenuItem>
            <MenuItem
              icon={<RiDeleteBin2Line />}
              onClick={() => actions.deleteFile(name)}
              isDisabled={isMainFile}
              aria-label={deleteFile}
            >
              {deleteFile}
            </MenuItem>
          </MenuList>
        </Portal>
      </Menu>
    </HStack>
  );
};

export default FileRow;
