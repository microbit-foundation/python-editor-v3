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
      colorScheme="gray"
      text="Load…"
      // .mpy isn't supported but better to explain ourselves
      accept=".hex, .py, .mpy"
      onOpen={actions.load}
      data-testid="open"
      multiple
      icon={<RiFolderOpenLine />}
    />
  );
};

export default LoadButton;
