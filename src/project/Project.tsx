import Workbench from "../workbench/Workbench";
import { useProject } from "./project-hooks";

const Project = () => {
  const { projectId } = useProject();
  // Keep it simple by throwing away everything when changing project.
  return <Workbench key={projectId} />;
};

export default Project;
