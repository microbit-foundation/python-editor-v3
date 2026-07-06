/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import debounce from "lodash.debounce";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useIntl } from "react-intl";
import LoadingOverlay from "../common/LoadingOverlay";
import { projectsDb, ProjectRecord } from "../fs/db";
import { useFileSystem } from "../fs/fs-hooks";
import { generateId } from "../fs/fs-util";
import { defaultInitialProject } from "../fs/initial-project";
import {
  addProjectSyncListener,
  postProjectSync,
  ProjectSyncMessageType,
} from "../fs/project-sync";

const CURRENT_PROJECT_KEY = "currentProjectId";

const getStoredCurrentProjectId = (): string | undefined =>
  window.sessionStorage.getItem(CURRENT_PROJECT_KEY) ?? undefined;

const setStoredCurrentProjectId = (id: string | undefined) => {
  if (id) {
    window.sessionStorage.setItem(CURRENT_PROJECT_KEY, id);
  } else {
    window.sessionStorage.removeItem(CURRENT_PROJECT_KEY);
  }
};

/**
 * A stable serialization of a project's syncable content, used to detect
 * whether the file system state actually differs from what is stored. This
 * lets autosave skip no-op writes and, crucially, stops a cross-tab reload
 * from bouncing back out as a fresh change.
 */
const serializeProject = (
  name: string | undefined,
  files: Record<string, string>
): string => {
  const keys = Object.keys(files).sort();
  return JSON.stringify({
    name: name ?? null,
    files: keys.map((k) => [k, files[k]]),
  });
};

export interface ProjectsContextValue {
  /** All projects in the library, most recently modified first. */
  projects: ProjectRecord[];
  /** True until the initial load from IndexedDB has completed. */
  loading: boolean;
  /** The id of the project currently persisted as "open" (session scoped). */
  currentProjectId: string | undefined;
  /** The id of the project currently loaded into the editor, if any. */
  loadedProjectId: string | undefined;
  /** Reload the project list from storage. */
  refresh: () => Promise<void>;
  /** Create a new project, load it into the editor and return its id. */
  createProject: (name: string) => Promise<string>;
  /**
   * Create a new project whose contents come from a single file-system
   * mutation (e.g. loading a hex), and load it into the editor.
   *
   * Unlike {@link createProject} this performs exactly one file-system change,
   * so the editor transitions straight from the previous project to the
   * imported one with no intermediate "default project" flash. The previously
   * open project is left untouched. Rejects (rolling back the new project) if
   * `populateFs` throws.
   *
   * @param name Fallback project name if the content doesn't specify one.
   * @param populateFs Replaces the file system with the imported content.
   */
  importProject: (
    name: string,
    populateFs: () => Promise<void>
  ) => Promise<string>;
  /**
   * Load a project into the editor working copy.
   * Returns false if the project no longer exists.
   */
  openProject: (id: string) => Promise<boolean>;
  renameProject: (id: string, name: string) => Promise<void>;
  duplicateProject: (id: string, name: string) => Promise<string>;
  deleteProject: (id: string) => Promise<void>;
}

const ProjectsContext = createContext<ProjectsContextValue | undefined>(
  undefined
);

const byTimestampDesc = (a: ProjectRecord, b: ProjectRecord) =>
  b.timestamp - a.timestamp;

export const ProjectsProvider = ({ children }: { children: ReactNode }) => {
  const fs = useFileSystem();
  const intl = useIntl();
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentProjectId, setCurrentProjectId] = useState<string | undefined>(
    getStoredCurrentProjectId
  );
  // The project currently loaded into the in-memory file system. Autosave is
  // only active for this project so that a page load (which initialises the
  // file system with a default program) can't overwrite a stored project.
  const [loadedProjectId, setLoadedProjectId] = useState<string | undefined>(
    undefined
  );
  // Serialization of the last content we loaded or saved for the loaded
  // project, used to suppress redundant/echoed autosaves.
  const lastSyncedRef = useRef<{ id: string; serialized: string } | null>(null);
  // Shows a full-screen spinner while importing a project (e.g. from a hex).
  const [importing, setImporting] = useState(false);

  const untitled = intl.formatMessage({ id: "untitled-project" });

  const refresh = useCallback(async () => {
    const all = await projectsDb.getAll();
    all.sort(byTimestampDesc);
    setProjects(all);
  }, []);

  const setCurrent = useCallback((id: string | undefined) => {
    setStoredCurrentProjectId(id);
    setCurrentProjectId(id);
  }, []);

  const loadIntoFs = useCallback(
    async (record: ProjectRecord) => {
      await fs.replaceWithMultipleFiles({
        files: record.files,
        projectName: record.name,
      });
      lastSyncedRef.current = {
        id: record.id,
        serialized: serializeProject(record.name, record.files),
      };
      setLoadedProjectId(record.id);
    },
    [fs]
  );

  // Seed / migrate on first load. If the library is empty we migrate any
  // existing single-project work (held by the file system's session storage)
  // into IndexedDB as the first project.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const all = await projectsDb.getAll();
      if (all.length === 0) {
        await fs.initialize();
        const existing = await fs.getPythonProject();
        if (Object.keys(existing.files).length > 0) {
          const record: ProjectRecord = {
            id: generateId(),
            name: existing.projectName ?? untitled,
            files: existing.files,
            timestamp: Date.now(),
          };
          await projectsDb.put(record);
        }
      }
      if (!cancelled) {
        await refresh();
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // Intentionally only run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createProject = useCallback(
    async (name: string) => {
      const record: ProjectRecord = {
        id: generateId(),
        name,
        files: { ...defaultInitialProject.files },
        timestamp: Date.now(),
      };
      await projectsDb.put(record);
      setCurrent(record.id);
      await loadIntoFs(record);
      await refresh();
      postProjectSync({
        type: ProjectSyncMessageType.ReloadProject,
        projectIds: [record.id],
      });
      return record.id;
    },
    [loadIntoFs, refresh, setCurrent]
  );

  const importProject = useCallback(
    async (name: string, populateFs: () => Promise<void>) => {
      const id = generateId();
      // Point the current/loaded project at the new id *before* mutating the
      // file system, so autosave targets the new project and can never write
      // the imported content back over the previously open one.
      setCurrent(id);
      setLoadedProjectId(id);
      lastSyncedRef.current = null;
      // The overlay hides the file-system transition (previous project ->
      // imported project) and the navigation that follows.
      setImporting(true);
      try {
        try {
          await populateFs();
        } catch (e) {
          // Roll back: nothing was persisted under this id yet.
          await projectsDb.delete(id);
          setLoadedProjectId(undefined);
          setCurrent(undefined);
          throw e;
        }
        const pythonProject = await fs.getPythonProject();
        const record: ProjectRecord = {
          id,
          name: pythonProject.projectName ?? name,
          files: pythonProject.files,
          timestamp: Date.now(),
        };
        await projectsDb.put(record);
        lastSyncedRef.current = {
          id,
          serialized: serializeProject(record.name, record.files),
        };
        await refresh();
        postProjectSync({
          type: ProjectSyncMessageType.ReloadProject,
          projectIds: [id],
        });
        return id;
      } finally {
        setImporting(false);
      }
    },
    [fs, refresh, setCurrent]
  );

  const openProject = useCallback(
    async (id: string) => {
      if (loadedProjectId === id) {
        setCurrent(id);
        return true;
      }
      const record = await projectsDb.get(id);
      if (!record) {
        return false;
      }
      setCurrent(id);
      await loadIntoFs(record);
      // Bump recency. Deliberately not broadcast: it must not cause other tabs
      // editing the same project to reload and lose in-flight edits.
      await projectsDb.put({ ...record, timestamp: Date.now() });
      await refresh();
      return true;
    },
    [loadIntoFs, loadedProjectId, refresh, setCurrent]
  );

  const renameProject = useCallback(
    async (id: string, name: string) => {
      const record = await projectsDb.get(id);
      if (!record) {
        return;
      }
      await projectsDb.put({ ...record, name, timestamp: Date.now() });
      if (id === loadedProjectId) {
        await fs.setProjectName(name);
        lastSyncedRef.current = {
          id,
          serialized: serializeProject(name, record.files),
        };
      }
      await refresh();
      postProjectSync({
        type: ProjectSyncMessageType.ReloadProject,
        projectIds: [id],
      });
    },
    [fs, loadedProjectId, refresh]
  );

  const duplicateProject = useCallback(
    async (id: string, name: string) => {
      const record = await projectsDb.get(id);
      if (!record) {
        return id;
      }
      const newRecord: ProjectRecord = {
        id: generateId(),
        name,
        files: { ...record.files },
        timestamp: Date.now(),
      };
      await projectsDb.put(newRecord);
      await refresh();
      postProjectSync({
        type: ProjectSyncMessageType.ReloadProject,
        projectIds: [newRecord.id],
      });
      return newRecord.id;
    },
    [refresh]
  );

  const deleteProject = useCallback(
    async (id: string) => {
      await projectsDb.delete(id);
      if (id === currentProjectId) {
        setCurrent(undefined);
      }
      if (id === loadedProjectId) {
        setLoadedProjectId(undefined);
        lastSyncedRef.current = null;
      }
      await refresh();
      postProjectSync({
        type: ProjectSyncMessageType.DeleteProject,
        projectIds: [id],
      });
    },
    [currentProjectId, loadedProjectId, refresh, setCurrent]
  );

  // Autosave the currently loaded project back to IndexedDB as it is edited,
  // and broadcast the change to other tabs.
  useEffect(() => {
    if (!loadedProjectId) {
      return;
    }
    const save = debounce(async () => {
      const pythonProject = await fs.getPythonProject();
      const serialized = serializeProject(
        pythonProject.projectName,
        pythonProject.files
      );
      if (
        lastSyncedRef.current?.id === loadedProjectId &&
        lastSyncedRef.current.serialized === serialized
      ) {
        // No real change (e.g. this edit came from loading a cross-tab update).
        return;
      }
      const existing = await projectsDb.get(loadedProjectId);
      await projectsDb.put({
        id: loadedProjectId,
        name: pythonProject.projectName ?? existing?.name ?? untitled,
        files: pythonProject.files,
        timestamp: Date.now(),
      });
      lastSyncedRef.current = { id: loadedProjectId, serialized };
      postProjectSync({
        type: ProjectSyncMessageType.ReloadProject,
        projectIds: [loadedProjectId],
      });
    }, 1_000);
    fs.addEventListener("project_updated", save);
    fs.addEventListener("file_text_updated", save);
    return () => {
      fs.removeEventListener("project_updated", save);
      fs.removeEventListener("file_text_updated", save);
      save.cancel();
    };
  }, [fs, loadedProjectId, untitled]);

  // React to changes broadcast from other tabs.
  useEffect(() => {
    return addProjectSyncListener((message) => {
      void (async () => {
        // Keep the project library list current everywhere.
        await refresh();
        if (!loadedProjectId || !message.projectIds.includes(loadedProjectId)) {
          return;
        }
        if (message.type === ProjectSyncMessageType.ReloadProject) {
          const record = await projectsDb.get(loadedProjectId);
          if (record) {
            // Reloads editor content; dedup ref prevents this echoing back out.
            await loadIntoFs(record);
          }
        } else if (message.type === ProjectSyncMessageType.DeleteProject) {
          // The open project was deleted elsewhere. Clearing loadedProjectId
          // makes ProjectGate redirect back to the home page.
          setLoadedProjectId(undefined);
          setCurrent(undefined);
          lastSyncedRef.current = null;
        }
      })();
    });
  }, [loadIntoFs, loadedProjectId, refresh, setCurrent]);

  const value = useMemo<ProjectsContextValue>(
    () => ({
      projects,
      loading,
      currentProjectId,
      loadedProjectId,
      refresh,
      createProject,
      importProject,
      openProject,
      renameProject,
      duplicateProject,
      deleteProject,
    }),
    [
      projects,
      loading,
      currentProjectId,
      loadedProjectId,
      refresh,
      createProject,
      importProject,
      openProject,
      renameProject,
      duplicateProject,
      deleteProject,
    ]
  );

  return (
    <ProjectsContext.Provider value={value}>
      <LoadingOverlay loading={importing} />
      {children}
    </ProjectsContext.Provider>
  );
};

export const useProjects = (): ProjectsContextValue => {
  const value = useContext(ProjectsContext);
  if (!value) {
    throw new Error("Missing ProjectsProvider");
  }
  return value;
};

export { getStoredCurrentProjectId };
