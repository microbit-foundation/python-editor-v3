import { BoxProps } from "@chakra-ui/layout";
import FileDropTarget from "../common/FileDropTarget";
import { useProjectActions } from "./project-hooks";

interface ProjectDropTargetProps extends BoxProps {
  children: React.ReactElement;
}

const ProjectDropTarget = ({ children, ...props }: ProjectDropTargetProps) => {
  const actions = useProjectActions();
  return (
    <FileDropTarget
      {...props}
      data-testid="project-drop-target"
      onFileDrop={actions.load}
    >
      {children}
    </FileDropTarget>
  );
};

export default ProjectDropTarget;
