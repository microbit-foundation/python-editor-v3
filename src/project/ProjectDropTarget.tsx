import FileDropTarget from "../common/FileDropTarget";
import { useProjectActions } from "./use-project-actions";

interface ProjectDropTargetProps {
  children: React.ReactElement;
}

const ProjectDropTarget = ({ children }: ProjectDropTargetProps) => {
  const actions = useProjectActions();
  return <FileDropTarget onFileDrop={actions.open}>{children}</FileDropTarget>;
};

export default ProjectDropTarget;
