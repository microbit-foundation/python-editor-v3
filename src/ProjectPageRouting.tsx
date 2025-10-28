import { ReactNode, useEffect } from "react";
import { useRouterState } from "./router-hooks";
import ProjectBrowser from "./project/ProjectBrowser";
import { useProjectStorage } from "./project-persistence/ProjectStorageProvider";

interface ProjectPageRoutingProps {
  children: ReactNode;
}
const ProjectPageRouting = ({ children }: ProjectPageRoutingProps) => {
  const [{ tab }, navigate] = useRouterState();
  const { projectId, restoreMostRecentProject } = useProjectStorage();

  useEffect(() => {
    if (!projectId) {
      const restoreState = async () => {
        const restoredProject = await restoreMostRecentProject();
        if (!restoredProject && typeof tab !== "undefined") {
          history.replaceState(null, "", "/");
          window.dispatchEvent(new PopStateEvent("popstate"));
        }
      };
      void restoreState();
    }
  }, []);

  if (typeof tab === "undefined") {
    return <ProjectBrowser />;
  }
  return children;
};

export default ProjectPageRouting;
