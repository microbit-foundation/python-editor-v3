// ProjectContext.tsx
import React, { createContext, useCallback, useContext, useState } from "react";
import { ProjectList } from "./project-list-db";
import { ProjectStore } from "./project-store";

interface ProjectContextValue {
  projectId: string | null;
  projectList: ProjectList | null;
  setProjectList: (projectList: ProjectList) => void;
  projectStore: ProjectStore | null;
  setProjectStore: (projectStore: ProjectStore) => void;
}

export const ProjectStorageContext = createContext<ProjectContextValue | null>(
  null
);

/**
 * The ProjectStorageProvider is intended to be used only through the hooks in
 *
 * - project-list-hooks.ts: information about hooks that does not require an open project
 * - persistent-project-hooks.ts: manages a currently open project
 * - project-history-hooks.ts: manages project history and revisions
 *
 * This structure is helpful for working out what parts of project persistence are used
 * where.
 */
export function ProjectStorageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [projectList, setProjectList] = useState<ProjectList | null>(null);
  const [projectStore, setProjectStoreImpl] = useState<ProjectStore | null>(
    null
  );
  const setProjectStore = useCallback(
    (newProjectStore: ProjectStore) => {
      if (projectStore) {
        projectStore.destroy();
      }
      setProjectStoreImpl(newProjectStore);
    },
    [projectStore]
  );

  return (
    <ProjectStorageContext.Provider
      value={{
        projectId: projectStore ? projectStore.projectId : null,
        projectList,
        setProjectList,
        projectStore,
        setProjectStore,
      }}
    >
      {children}
    </ProjectStorageContext.Provider>
  );
}

export function useProjectStorage() {
  const ctx = useContext(ProjectStorageContext);
  if (!ctx)
    throw new Error(
      "useProjectStorage must be used within a ProjectStorageProvider"
    );
  return ctx;
}
