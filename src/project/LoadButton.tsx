import React from "react";
import { RiFolderOpenLine } from "react-icons/ri";
import { CollapsableButtonComposibleProps } from "../common/CollapsibleButton";
import FileInputButton from "../common/FileInputButton";
import { useProjectActions } from "./project-hooks";

interface LoadButtonProps extends CollapsableButtonComposibleProps {}

/**
 * Open HEX button, with an associated input field.
 */
const LoadButton = ({ children, ...props }: LoadButtonProps) => {
  const actions = useProjectActions();
  return (
    <FileInputButton
      {...props}
      text="Load…"
      onOpen={actions.load}
      data-testid="open"
      multiple
      icon={<RiFolderOpenLine />}
      tooltip="Load a hex or Python file or add other files"
    />
  );
};

export default LoadButton;
