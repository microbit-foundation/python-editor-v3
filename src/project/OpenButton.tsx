import React from "react";
import { RiFolderOpenLine } from "react-icons/ri";
import { CollapsableButtonComposibleProps } from "../common/CollapsibleButton";
import FileInputButton from "../common/FileInputButton";
import { useProjectActions } from "./project-hooks";

interface OpenButtonProps extends CollapsableButtonComposibleProps {
  text?: string;
}

/**
 * Open HEX button, with an associated input field.
 */
const OpenButton = ({ children, text, ...props }: OpenButtonProps) => {
  const actions = useProjectActions();
  return (
    <FileInputButton
      {...props}
      text={text || "Load files…"}
      // .mpy isn't supported but better to explain ourselves
      accept=".hex, .py, .mpy"
      onOpen={actions.load}
      data-testid="open"
      multiple
      icon={<RiFolderOpenLine />}
    />
  );
};

export default OpenButton;
