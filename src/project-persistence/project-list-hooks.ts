import { useCallback, useContext, useEffect } from "react";
import { ProjectStorageContext } from "./ProjectStorageProvider";
import * as Y from "yjs";
import { ProjectStore } from "./project-store";
import { modifyProject, ProjectList, withProjectDb } from "./project-list-db";
import { makeUID } from "./utils";

export interface NewStoredDoc {
    id: string;
    ydoc: Y.Doc;
}

export interface RestoredStoredDoc {
    projectName: string;
    ydoc: Y.Doc;
}

interface ProjectListActions {
    newStoredProject: () => Promise<NewStoredDoc>;
    restoreStoredProject: (id: string) => Promise<RestoredStoredDoc>;
    deleteProject: (id: string) => Promise<void>;
    setProjectName: (id: string, name: string) => Promise<void>;
    projectList: ProjectList | null;
}

export const useProjectList = (): ProjectListActions => {

    const ctx = useContext(ProjectStorageContext);

    if (!ctx) {
        throw new Error(
            "useProjectList must be used within a ProjectStorageProvider"
        );
    }

    const { setProjectList, projectList, setProjectStore } = ctx;

    const refreshProjects = useCallback(async () => {
        const projectList = await withProjectDb("readonly", async (store) => {
            const projectList = await new Promise((res, _rej) => {
                const query = store.index("modifiedDate").getAll();
                query.onsuccess = () => res(query.result);
            });
            return projectList;
        });
        setProjectList((projectList as ProjectList).reverse());
    }, [setProjectList]);

    useEffect(() => {
        if (window.navigator.storage?.persist) {
            void window.navigator.storage.persist();
        }
        void refreshProjects();
    }, [refreshProjects]);

      const setProjectName = useCallback(
        async (id: string, projectName: string) => {
          await modifyProject(id, { projectName });
          await refreshProjects();
        },
        [refreshProjects]
      );

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
        [projectList, setProjectStore]
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
        }, [ setProjectStore]);

    const deleteProject: (id: string) => Promise<void> = useCallback(
        async (id) => {
            await withProjectDb("readwrite", async (store) => {
                store.delete(id);
                return refreshProjects();
            });
        },
        [refreshProjects]
    );

    return {
        restoreStoredProject,
        newStoredProject,
        deleteProject,
        setProjectName,
        projectList
    };
}
