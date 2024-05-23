/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { RiFolderOpenLine } from "react-icons/ri";
import { useIntl } from "react-intl";
import { CollapsibleButtonComposableProps } from "../common/CollapsibleButton";
import FileInputButton from "../common/FileInputButton";
import { useProjectActions } from "./project-hooks";

type FileType = "hex" | "mljson";

interface OpenButtonProps extends CollapsibleButtonComposableProps {
  fileType?: FileType;
}

/**
 * Open HEX button, with an associated input field.
 */
const OpenButton = ({
  children,
  fileType = "hex",
  ...props
}: OpenButtonProps) => {
  const actions = useProjectActions();
  const intl = useIntl();
  return (
    <FileInputButton
      {...props}
      text={intl.formatMessage({
        id: "open-file-action",
      })}
      onOpen={fileType === "hex" ? actions.loadHex : actions.loadMlJson}
      data-testid="open"
      multiple
      icon={<RiFolderOpenLine />}
      tooltip={intl.formatMessage({
        id: "open-hover",
      })}
    />
  );
};

export default OpenButton;
