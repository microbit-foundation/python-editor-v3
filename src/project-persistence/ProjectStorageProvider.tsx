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
      const newProjectStore = new ProjectStore(projectId);
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
      const newProjectStore = new ProjectStore(newProjectId);
      await newProjectStore.init();
      setProjectStore(newProjectStore);
      return { ydoc: newProjectStore.ydoc, id: newProjectId };
    }, []);

  // TODO: Get rid of debug hooks
  (window as unknown as any).projectList = projectList;
  (window as unknown as any).newProjectStore = newStoredProject;
  (window as unknown as any).restoreProjectStore = restoreStoredProject;

  useEffect(() => {
    if (window.navigator.storage?.persist) {
      window.navigator.storage.persist();
    }
    const getProjectsAsync = async () => {
      const projectList = await withProjectDb("readonly", async (store) => {
        const projectList = await new Promise((res, rej) => {
          const query = store.index("modifiedDate").getAll();
          query.onsuccess = () => res(query.result);
          query.onerror = rej;
        });
        return projectList;
      });
      setProjectList((projectList as ProjectList).reverse());
    };
    void getProjectsAsync();
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
          query.onerror = rej;
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

