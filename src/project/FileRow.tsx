/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
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
import { FormattedMessage, useIntl } from "react-intl";
import { zIndexProjectAreaMenu } from "../common/zIndex";
import { FileVersion, MAIN_FILE } from "../fs/fs";
import { useProjectActions } from "./project-hooks";
import { isEditableFile } from "./project-utils";

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

  return (
    <HStack {...props} justify="space-between" lineHeight={2}>
      {/* Accessibility for edit is via the row actions */}
      <Text
        as="span"
        onClick={onEdit}
        variant="unstyled"
        fontSize="md"
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
          fontSize="xl"
          variant="ghost"
          icon={<MdMoreVert />}
          color="grey.800"
        />
        <Portal>
          <MenuList zIndex={zIndexProjectAreaMenu}>
            <MenuItem
              icon={<RiEdit2Line />}
              isDisabled={!isEditableFile(name)}
              onClick={onEdit}
            >
              <FormattedMessage id="edit-file-action" values={{ name }} />
            </MenuItem>
            <MenuItem
              icon={<RiDownload2Line />}
              onClick={() => actions.saveFile(name)}
            >
              <FormattedMessage id="save-file-action" values={{ name }} />
            </MenuItem>
            <MenuItem
              icon={<RiDeleteBin2Line />}
              onClick={() => actions.deleteFile(name)}
              isDisabled={isMainFile}
            >
              <FormattedMessage id="delete-file-action" values={{ name }} />
            </MenuItem>
          </MenuList>
        </Portal>
      </Menu>
    </HStack>
  );
};

export default FileRow;
