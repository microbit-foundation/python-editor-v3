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
import { ProjectEntry, ProjectList, withProjectDb } from "./project-list-db";
import { ProjectStore } from "./project-store";
import { HistoryEntry, HistoryList, withHistoryDb } from "./project-history-db";

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

  getHistory: (projectId: string) => Promise<HistoryList>;
  loadRevision: (projectId: string, projectRevision: string) => Promise<void>;
  saveRevision: (projectInfo: ProjectEntry) => Promise<void>;
}

const ProjectStorageContext = createContext<ProjectContextValue | null>(null);

/**
 * Note on how projects are stored. The HEAD document is a Y document and maintains
 * its state using y-indexeddb persistence. Revisions are stored as state deltas using
 * the update format, and loading one reconstructs the HEAD document.
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
      await newProjectStore.persist();
      newProjectStore.startSyncing();
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
      await newProjectStore.persist();
      newProjectStore.startSyncing();
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
      const projectList = await new Promise((res, _rej) => {
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
    async (id: string, extras?: Partial<ProjectEntry>) => {
      await withProjectDb("readwrite", async (store) => {
        await new Promise((res, rej) => {
          const getQuery = store.get(id);
          getQuery.onsuccess = () => {
            const putQuery = store.put({
              ...getQuery.result,
              ...extras,
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
      await modifyProject(id, { projectName });
      await refreshProjects();
    },
    [projectStore]
  );

  // Revision history stuff

  const getUpdateAtRevision = async (projectId: string, revision: string) => {
    let deltas: HistoryEntry[] = [];
    let parentRevision = revision;
    do {
      const delta = await withHistoryDb("readonly", async (revisions) => {
        return new Promise<HistoryEntry>((res, _rej) => {
          const query = revisions
            .index("projectRevision")
            .get([projectId, parentRevision]);
          query.onsuccess = () => res(query.result as HistoryEntry);
        });
      });
      parentRevision = delta.parentId;
      deltas.unshift(delta);
    } while (parentRevision);
    return Y.mergeUpdatesV2(deltas.map((d) => d.data));
  };

  const getProjectInfo = (projectId: string) =>
    withProjectDb("readwrite", async (store) => {
      return new Promise<ProjectEntry>((res, _rej) => {
        const query = store.get(projectId);
        query.onsuccess = () => res(query.result);
      });
    });

  const loadRevision = async (projectId: string, projectRevision: string) => {
    const projectInfo = await getProjectInfo(projectId);
    const { ydoc, id: forkId } = await newStoredProject();
    await modifyProject(forkId, {
      projectName: `${projectInfo.projectName} revision`,
      parentRevision: forkId,
    });
    const updates = await getUpdateAtRevision(projectId, projectRevision);
    Y.applyUpdateV2(ydoc, updates);
  };

  const saveRevision = async (projectInfo: ProjectEntry) => {
    const projectStore = new ProjectStore(projectInfo.id, () => {});
    await projectStore.persist();
    let newUpdate: Uint8Array;
    if (projectInfo.parentRevision) {
      const previousUpdate = await getUpdateAtRevision(
        projectInfo.id,
        projectInfo.parentRevision
      );
      newUpdate = Y.encodeStateAsUpdateV2(projectStore.ydoc, previousUpdate);
    } else {
      newUpdate = Y.encodeStateAsUpdateV2(projectStore.ydoc);
    }
    const newRevision = makeUID();
    await withHistoryDb("readwrite", async (revisions) => {
      return new Promise<void>((res, _rej) => {
        const query = revisions.put({
          projectId: projectInfo.id,
          revisionId: newRevision,
          parentId: projectInfo.parentRevision,
          data: newUpdate,
          timestamp: new Date(),
        });
        query.onsuccess = () => res();
      });
    });
    await modifyProject(projectInfo.id, { parentRevision: newRevision });
  };

  const getHistory = async (projectId: string) =>
    withHistoryDb("readonly", async (store) => {
      const revisionList = await new Promise<HistoryList>((res, _rej) => {
        const query = store.index("projectId").getAll(projectId);
        query.onsuccess = () => res(query.result);
      });
      return revisionList;
    });

  // TODO: remove debug stuff
  (window as any).loadRevision = loadRevision;
  (window as any).saveRevision = saveRevision;
  (window as any).getHistory = getHistory;

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
        getHistory,
        loadRevision,
        saveRevision,
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

