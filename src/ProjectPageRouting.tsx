import { ReactNode, useEffect } from "react";
import { useRouterState } from "./router-hooks";
import ProjectBrowser from "./project/ProjectBrowser";
import { useProjectList } from "./project-persistence/project-list-hooks";
import { usePersistentProject } from "./project-persistence/persistent-project-hooks";

interface ProjectPageRoutingProps {
  children: ReactNode;
}
const ProjectPageRouting = ({ children }: ProjectPageRoutingProps) => {
  const [{ tab }] = useRouterState();
  const { projectList, restoreStoredProject } = useProjectList();
  const { projectId } = usePersistentProject();

  useEffect(() => {
    if (!projectId && projectList) {
      const restoreState = async () => {
        const restoredProject = await restoreStoredProject(projectList[0].id);
        if (!restoredProject && typeof tab !== "undefined") {
          history.replaceState(null, "", "/");
          window.dispatchEvent(new PopStateEvent("popstate"));
        }
      };
      void restoreState();
    }
  }, [projectId, projectList, restoreStoredProject, tab]);

  if (typeof tab === "undefined") {
    return <ProjectBrowser />;
  }
  return children;
};

export default ProjectPageRouting;
