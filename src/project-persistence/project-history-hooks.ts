import { useCallback, useContext } from "react";
import { ProjectStorageContext } from "./ProjectStorageProvider";
import { HistoryEntry, HistoryList, withHistoryDb } from "./project-history-db";
import { modifyProject, ProjectEntry, withProjectDb } from "./project-list-db";
import { makeUID } from "./utils";
import * as Y from "yjs";
import { ProjectStore } from "./project-store";
import { useProjectList } from "./project-list-hooks";

/**
 * Each project has a "head" which is a Y.Doc, and a series of revisions which are Y.js Update deltas.
 */
interface ProjectHistoryActions {
    getHistory: (projectId: string) => Promise<HistoryList>;
    /**
     * Note that loading a revision creates a new instance of the project at that revision.
     *
     * TODO: if a user loads a revision and doesn't modify it, should we even keep it around?
     */
    loadRevision: (projectId: string, projectRevision: string) => Promise<void>;
    /**
     * Converts the head of the given project into a revision.
     *
     * TODO: prevent creating empty revisions if nothing changes.
     */
    saveRevision: (projectInfo: ProjectEntry) => Promise<void>;
}

export const useProjectHistory = (): ProjectHistoryActions => {
    const ctx = useContext(ProjectStorageContext);
    if (!ctx) {
        throw new Error(
            "useProjectHistory must be used within a ProjectStorageProvider"
        );
    }
    const { newStoredProject } = useProjectList();

    const getUpdateAtRevision = useCallback(async (projectId: string, revision: string) => {
        const deltas: HistoryEntry[] = [];
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
    }, []);

    const getProjectInfo = (projectId: string) =>
        withProjectDb("readwrite", async (store) => {
            return new Promise<ProjectEntry>((res, _rej) => {
                const query = store.get(projectId);
                query.onsuccess = () => res(query.result as ProjectEntry);
            });
        });

    const loadRevision = useCallback(async (projectId: string, projectRevision: string) => {
        const projectInfo = await getProjectInfo(projectId);
        const { ydoc, id: forkId } = await newStoredProject();
        await modifyProject(forkId, {
            projectName: `${projectInfo.projectName} revision`,
            parentRevision: forkId,
        });
        const updates = await getUpdateAtRevision(projectId, projectRevision);
        Y.applyUpdateV2(ydoc, updates);
    }, [getUpdateAtRevision, newStoredProject]);

    const saveRevision = useCallback(async (projectInfo: ProjectEntry) => {
        const projectStore = new ProjectStore(projectInfo.id, () => { });
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
    }, [getUpdateAtRevision]);

    const getHistory = useCallback(async (projectId: string) =>
        withHistoryDb("readonly", async (store) => {
            const revisionList = await new Promise<HistoryList>((res, _rej) => {
                const query = store.index("projectId").getAll(projectId);
                query.onsuccess = () => res(query.result);
            });
            return revisionList;
        }), []);


    return { getHistory, loadRevision, saveRevision };
}
