import { Grid } from "@chakra-ui/react";
import { useProjectStorage } from "../project-persistence/ProjectStorageProvider";
import { useRouterState } from "../router-hooks";
import { useProjectActions } from "./project-hooks";
import {
  ProjectItem,
  AddProjectItem,
} from "../project-persistence/ProjectItem";

const ProjectBrowser = () => {
  const { projectList, deleteProject } = useProjectStorage();
  const { newProject, loadProject } = useProjectActions();
  const [_, setParams] = useRouterState();

  return (
    <Grid
      position="relative"
      backgroundColor="whitesmoke"
      templateColumns="repeat(auto-fill, 400px)"
    >
      <AddProjectItem
        key="projectAdd"
        newProject={async () => {
          await newProject();
          setParams({ tab: "project" });
        }}
      />
      {projectList?.map((proj) => (
        <ProjectItem
          key={proj.id}
          project={proj}
          loadProject={async () => {
            await loadProject(proj.id);
            setParams({ tab: "project" });
          }}
          deleteProject={deleteProject}
        />
      ))}
    </Grid>
  );
};

export default ProjectBrowser;
