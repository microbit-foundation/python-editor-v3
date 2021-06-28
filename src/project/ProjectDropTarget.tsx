/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { BoxProps } from "@chakra-ui/layout";
import { useCallback } from "react";
import FileDropTarget from "../common/FileDropTarget";
import { useProjectActions } from "./project-hooks";

interface ProjectDropTargetProps extends BoxProps {
  children: React.ReactElement;
}

const ProjectDropTarget = ({ children, ...props }: ProjectDropTargetProps) => {
  const actions = useProjectActions();
  const handleDrop = useCallback(
    (files: File[]) => {
      actions.load(files, "drop-load");
    },
    [actions]
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
