import { Grid } from "@chakra-ui/react";
import { useProjectStorage } from "../project-persistence/ProjectStorageProvider";
import { useRouterState } from "../router-hooks";
import { useProjectActions } from "./project-hooks";
import {
  ProjectItem,
  AddProjectItem,
} from "../project-persistence/ProjectItem";
import RenameProjectModal from "../project-persistence/RenameProjectModal";
import { useState } from "react";
import { ProjectEntry } from "../project-persistence/project-list-db";
import ProjectHistoryModal from "../project-persistence/ProjectHistoryModal";
import { useProjectList } from "../project-persistence/project-list-hooks";
import { useProjectHistory } from "../project-persistence/project-history-hooks";

const ProjectBrowser = () => {
  const { projectList } = useProjectStorage();
  const { deleteProject, setProjectName } = useProjectList();
  const { loadRevision } = useProjectHistory();

  const { newProject, loadProject } = useProjectActions();
  const [_, setParams] = useRouterState();
  const [showProjectHistory, setShowProjectHistory] =
    useState<ProjectEntry | null>(null);
  const [showProjectRename, setShowProjectRename] =
    useState<ProjectEntry | null>(null);

  return (
    <>
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
            renameProject={() => setShowProjectRename(proj)}
            showHistory={() => setShowProjectHistory(proj)}
          />
        ))}
      </Grid>
      <ProjectHistoryModal
        isOpen={showProjectHistory !== null}
        onLoadRequest={async (projectId, revisionId) => {
          await loadRevision(projectId, revisionId);
          setParams({ tab: "project" });
        }}
        onDismiss={() => setShowProjectHistory(null)}
        projectInfo={showProjectHistory}
      />
      <RenameProjectModal
        isOpen={showProjectRename !== null}
        onDismiss={() => setShowProjectRename(null)}
        projectInfo={showProjectRename}
        handleRename={(projectId, projectName) => {
          setProjectName(projectId, projectName);
          setShowProjectRename(null);
        }}
      />
    </>
  );
};

export default ProjectBrowser;
