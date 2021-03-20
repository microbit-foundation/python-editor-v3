import { ButtonProps } from "@chakra-ui/react";
import React from "react";
import FileInputButton from "../common/FileInputButton";
import { useProjectActions } from "./project-hooks";

interface OpenButtonProps extends ButtonProps {}

/**
 * Open HEX button, with an associated input field.
 */
const OpenButton = ({ children, ...props }: OpenButtonProps) => {
  const actions = useProjectActions();
  return (
    <FileInputButton
      // .mpy isn't supported but better to explain ourselves
      accept=".hex, .py, .mpy"
      onOpen={actions.open}
      data-testid="open"
      variant="outline"
    >
      {children}
    </FileInputButton>
  );
};

export default OpenButton;
