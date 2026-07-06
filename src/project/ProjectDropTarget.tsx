/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { BoxProps } from "@chakra-ui/react";
import { useCallback } from "react";
import FileDropTarget from "../common/FileDropTarget";
import { useImportProject } from "./use-import-project";

interface ProjectDropTargetProps extends BoxProps {
  children: React.ReactElement;
}

const ProjectDropTarget = ({ children, ...props }: ProjectDropTargetProps) => {
  const importProject = useImportProject();
  const handleDrop = useCallback(
    (files: File[]) => {
      void importProject(files, "drop-load");
    },
    [importProject]
  );
  return (
    <FileDropTarget
      {...props}
      data-testid="project-drop-target"
      onFileDrop={handleDrop}
    >
      {children}
    </FileDropTarget>
  );
};

export default ProjectDropTarget;
