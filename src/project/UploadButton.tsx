import { ButtonProps } from "@chakra-ui/react";
import React from "react";
import { RiFileUploadLine } from "react-icons/ri";
import FileInputButton from "../common/FileInputButton";
import { useProjectActions } from "./project-hooks";

interface OpenButtonProps extends ButtonProps {}

/**
 * Upload button, with an associated input field.
 *
 * This adds or updates files in the file system rather than switching project.
 */
const UploadButton = ({ children, ...props }: OpenButtonProps) => {
  const actions = useProjectActions();
  return (
    <FileInputButton
      // .mpy isn't supported but better to explain ourselves
      onOpen={actions.addOrUpdateFile}
      leftIcon={<RiFileUploadLine />}
      {...props}
    >
      {children}
    </FileInputButton>
  );
};

export default UploadButton;
