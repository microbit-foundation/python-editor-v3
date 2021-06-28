/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import React from "react";
import { RiFolderOpenLine } from "react-icons/ri";
import { useIntl } from "react-intl";
import { CollapsableButtonComposibleProps } from "../common/CollapsibleButton";
import FileInputButton from "../common/FileInputButton";
import { useProjectActions } from "./project-hooks";

interface LoadButtonProps extends CollapsableButtonComposibleProps {}

/**
 * Open HEX button, with an associated input field.
 */
const LoadButton = ({ children, ...props }: LoadButtonProps) => {
  const actions = useProjectActions();
  const intl = useIntl();
  return (
    <FileInputButton
      {...props}
      text={intl.formatMessage({
        id: "load-button",
      })}
      onOpen={actions.load}
      data-testid="open"
      multiple
      icon={<RiFolderOpenLine />}
      tooltip={intl.formatMessage({
        id: "load-hover",
      })}
    />
  );
};

export default LoadButton;
