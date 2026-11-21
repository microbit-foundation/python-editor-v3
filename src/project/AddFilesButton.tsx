/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { RiFileAddLine } from "react-icons/ri";
import { useIntl } from "react-intl";
import { CollapsibleButtonComposableProps } from "../common/CollapsibleButton";
import FileInputButton from "../common/FileInputButton";
import { useProjectsDatabaseActive } from "../fs/storage-status";
import { useProjectActions } from "./project-hooks";

interface AddFilesButtonProps extends CollapsibleButtonComposableProps {}

/**
 * Adds files to the open project from the Files tab. A hex file becomes a
 * new project instead, or replaces the open one where there is no projects
 * database to keep both.
 */
const AddFilesButton = (props: AddFilesButtonProps) => {
  const actions = useProjectActions();
  const intl = useIntl();
  const projectsDatabaseActive = useProjectsDatabaseActive();
  return (
    <FileInputButton
      {...props}
      text={intl.formatMessage({
        id: "add-files-action",
      })}
      onOpen={actions.load}
      data-testid="add-files"
      multiple
      icon={<RiFileAddLine />}
      tooltip={intl.formatMessage({
        id: projectsDatabaseActive
          ? "add-files-hover"
          : "add-files-hover-replace",
      })}
    />
  );
};

export default AddFilesButton;
