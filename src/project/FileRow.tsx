/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  IconButton,
  MenuItem,
  MenuList,
  MenuTrigger,
  Text,
} from "@microbit/ui";
import { MouseEventHandler } from "react";
import { MdMoreVert } from "react-icons/md";
import { RiDeleteBin2Line, RiDownload2Line, RiEdit2Line } from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import { HStack } from "styled-system/jsx";
import { SystemStyleObject } from "styled-system/types";
import { FileVersion, MAIN_FILE } from "../fs/fs";
import { useProjectActions } from "./project-hooks";
import { isEditableFile } from "./project-utils";

interface FileRowProps {
  value: FileVersion;
  onEdit: () => void;
  onClick?: MouseEventHandler<HTMLDivElement>;
  css?: SystemStyleObject;
}

/**
 * A row in the files area.
 */
const FileRow = ({ value, onEdit, onClick, css: cssProp }: FileRowProps) => {
  const { name } = value;
  const isMainFile = name === MAIN_FILE;
  const actions = useProjectActions();
  const intl = useIntl();

  return (
    <HStack
      onClick={onClick}
      justify="space-between"
      lineHeight="2"
      css={cssProp}
    >
      {/* Accessibility for edit is via the row actions */}
      <Text
        as="span"
        onClick={onEdit}
        fontSize="md"
        flexGrow={1}
        textAlign="left"
        overflowX="hidden"
        textOverflow="ellipsis"
      >
        {name}
      </Text>
      <MenuTrigger>
        <IconButton
          aria-label={intl.formatMessage({ id: "file-actions" }, { name })}
          css={{ fontSize: "xl" }}
          variant="ghost"
        >
          <MdMoreVert />
        </IconButton>
        <MenuList>
          <MenuItem
            icon={<RiEdit2Line />}
            isDisabled={!isEditableFile(name)}
            onAction={onEdit}
          >
            <FormattedMessage id="edit-file-action" values={{ name }} />
          </MenuItem>
          <MenuItem
            icon={<RiDownload2Line />}
            onAction={() => actions.saveFile(name)}
          >
            <FormattedMessage id="save-file-action" values={{ name }} />
          </MenuItem>
          <MenuItem
            icon={<RiDeleteBin2Line />}
            onAction={() => actions.deleteFile(name)}
            isDisabled={isMainFile}
          >
            <FormattedMessage id="delete-file-action" values={{ name }} />
          </MenuItem>
        </MenuList>
      </MenuTrigger>
    </HStack>
  );
};

export default FileRow;
