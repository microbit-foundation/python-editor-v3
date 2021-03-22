import React from "react";
import { RiFolderOpenLine } from "react-icons/ri";
import { CollapsableButtonComposibleProps } from "../common/CollapsibleButton";
import FileInputButton from "../common/FileInputButton";
import { useProjectActions } from "./project-hooks";

interface OpenButtonProps extends CollapsableButtonComposibleProps {}

/**
 * Open HEX button, with an associated input field.
 */
const OpenButton = ({ children, ...props }: OpenButtonProps) => {
  const actions = useProjectActions();
  return (
    <FileInputButton
      {...props}
      text="Open a project"
      // .mpy isn't supported but better to explain ourselves
      accept=".hex, .py, .mpy"
      onOpen={actions.open}
      data-testid="open"
      icon={<RiFolderOpenLine />}
    />
  );
};

export default OpenButton;
