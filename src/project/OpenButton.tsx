/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { RiFileAddLine } from "react-icons/ri";
import { useIntl } from "react-intl";
import { CollapsibleButtonComposableProps } from "../common/CollapsibleButton";
import FileInputButton from "../common/FileInputButton";
import { useProjectActions } from "./project-hooks";

interface OpenButtonProps extends CollapsibleButtonComposableProps {}

/**
 * Add file(s) button, with an associated input field.
 */
const OpenButton = ({ children, ...props }: OpenButtonProps) => {
  const actions = useProjectActions();
  const intl = useIntl();
  return (
    <FileInputButton
      {...props}
      text={intl.formatMessage({
        id: "add-files-action",
      })}
      onOpen={actions.load}
      data-testid="open"
      multiple
      icon={<RiFileAddLine />}
      tooltip={intl.formatMessage({
        id: "add-files-hover",
      })}
    />
  );
};

export default OpenButton;
