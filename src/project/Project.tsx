import { useProject } from "../fs/fs-hooks";
import Workbench from "../workbench/Workbench";

const Project = () => {
  const { projectId } = useProject();
  // Keep it simple by throwing away everything when changing project.
  return <Workbench key={projectId} />;
};

export default Project;
