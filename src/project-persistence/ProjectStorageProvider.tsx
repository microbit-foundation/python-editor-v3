// ProjectContext.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import * as Y from "yjs";
import { Awareness } from "y-protocols/awareness";
import { ProjectList, withProjectDb } from "./project-list-db";
import { ProjectStore } from "./project-store";

export interface NewStoredDoc {
  id: string;
  ydoc: Y.Doc;
}

export interface RestoredStoredDoc {
  projectName: string;
  ydoc: Y.Doc;
}

interface ProjectContextValue {
  projectId: string | null;
  projectList: ProjectList | null;
  newStoredProject: () => Promise<NewStoredDoc>;
  restoreStoredProject: (id: string) => Promise<RestoredStoredDoc>;
  deleteProject: (id: string) => Promise<void>;
  ydoc: Y.Doc | null;
  awareness: Awareness | null;
  getFile: (filename: string) => Y.Text | null;
  setProjectName: (id: string, name: string) => Promise<void>;
}

const ProjectStorageContext = createContext<ProjectContextValue | null>(null);

export function ProjectStorageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [projectList, setProjectList] = useState<ProjectList | null>(null);
  const [projectStore, setProjectStoreImpl] = useState<ProjectStore | null>(
    null
  );
  const setProjectStore = (newProjectStore: ProjectStore) => {
    if (projectStore) {
      projectStore.destroy();
    }
    setProjectStoreImpl(newProjectStore);
  };

  const restoreStoredProject: (
    projectId: string
  ) => Promise<RestoredStoredDoc> = useCallback(
    async (projectId: string) => {
      const newProjectStore = new ProjectStore(projectId, () =>
        modifyProject(projectId)
      );
      await newProjectStore.init();
      setProjectStore(newProjectStore);
      return {
        ydoc: newProjectStore.ydoc,
        projectName: projectList!.find((prj) => prj.id === projectId)!
          .projectName,
      };
    },
    [projectList]
  );

  const newStoredProject: () => Promise<NewStoredDoc> =
    useCallback(async () => {
      const newProjectId = makeUID();
      await withProjectDb("readwrite", async (store) => {
        store.add({
          id: newProjectId,
          projectName: "Untitled project",
          modifiedDate: new Date().valueOf(),
        });
        return Promise.resolve();
      });
      const newProjectStore = new ProjectStore(newProjectId, () =>
        modifyProject(newProjectId)
      );
      await newProjectStore.init();
      setProjectStore(newProjectStore);
      return { ydoc: newProjectStore.ydoc, id: newProjectId };
    }, []);

  const deleteProject: (id: string) => Promise<void> = useCallback(
    async (id) => {
      await withProjectDb("readwrite", async (store) => {
        store.delete(id);
        return refreshProjects();
      });
    },
    []
  );

  // TODO: Get rid of debug hooks
  (window as unknown as any).projectList = projectList;
  (window as unknown as any).newProjectStore = newStoredProject;
  (window as unknown as any).restoreProjectStore = restoreStoredProject;
  (window as unknown as any).deleteProject = deleteProject;

  const refreshProjects = async () => {
    const projectList = await withProjectDb("readonly", async (store) => {
      const projectList = await new Promise((res, rej) => {
        const query = store.index("modifiedDate").getAll();
        query.onsuccess = () => res(query.result);
      });
      return projectList;
    });
    setProjectList((projectList as ProjectList).reverse());
  };

  useEffect(() => {
    if (window.navigator.storage?.persist) {
      window.navigator.storage.persist();
    }
    void refreshProjects();
  }, []);

  // Helper to access files
  const getFile = (filename: string) => {
    if (!projectStore) {
      return null;
    }
    const files = projectStore.ydoc.getMap<Y.Text>("files");
    if (!files.has(filename)) files.set(filename, new Y.Text());
    return files.get(filename)!;
  };

  const modifyProject = useCallback(
    async (id: string) => {
      await withProjectDb("readwrite", async (store) => {
        await new Promise((res, rej) => {
          const getQuery = store.get(id);
          getQuery.onsuccess = () => {
            const putQuery = store.put({
              ...getQuery.result,
              modifiedDate: new Date().valueOf(),
            });
            putQuery.onsuccess = () => res(getQuery.result);
          };
        });
      });
    },
    [projectStore]
  );

  const setProjectName = useCallback(
    async (id: string, projectName: string) => {
      await withProjectDb("readwrite", async (store) => {
        await new Promise((res, rej) => {
          const query = store.put({
            id,
            projectName,
            modifiedDate: new Date().valueOf(),
          });
          query.onsuccess = () => res(query.result);
        });
      });
    },
    [projectStore]
  );

  return (
    <ProjectStorageContext.Provider
      value={{
        ydoc: projectStore ? projectStore.ydoc : null,
        projectId: projectStore ? projectStore.projectId : null,
        projectList,
        awareness: projectStore ? projectStore.awareness : null,
        getFile,
        newStoredProject,
        restoreStoredProject,
        deleteProject,
        setProjectName,
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

// TODO: WORLDS UGLIEST UIDS
const makeUID = () => {
  return `${Math.random()}`;
};

