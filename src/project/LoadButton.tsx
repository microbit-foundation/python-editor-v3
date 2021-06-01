import React from "react";
import { RiUpload2Line } from "react-icons/ri";
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
      text="Upload…"
      onOpen={actions.load}
      data-testid="open"
      multiple
      icon={<RiUpload2Line />}
      tooltip="Upload a hex or Python file or add other files"
    />
  );
};

export default LoadButton;
