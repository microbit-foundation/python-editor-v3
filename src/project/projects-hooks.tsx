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
import { FileRecord, projectsDb, ProjectDataWithFiles } from "../fs/db";
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

/** Snapshot of the loaded project as persisted, used to compute file diffs. */
interface SyncedSnapshot {
  id: string;
  name: string | undefined;
  files: Record<string, string>;
}

export interface ProjectsContextValue {
  /** All projects (metadata + file names), most recently modified first. */
  projects: ProjectDataWithFiles[];
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
   * mutation (e.g. loading a hex), and load it into the editor. Performs
   * exactly one file-system change so the editor transitions straight from the
   * previous project to the imported one. Rejects (rolling back) on failure.
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

const byTimestampDesc = (a: ProjectDataWithFiles, b: ProjectDataWithFiles) =>
  b.timestamp - a.timestamp;

export const ProjectsProvider = ({ children }: { children: ReactNode }) => {
  const fs = useFileSystem();
  const intl = useIntl();
  const [projects, setProjects] = useState<ProjectDataWithFiles[]>([]);
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
  // What we last loaded/saved for the loaded project, used to compute which
  // files actually changed (so autosave only writes those) and to suppress
  // redundant/echoed saves.
  const lastSyncedRef = useRef<SyncedSnapshot | null>(null);
  // Shows a full-screen spinner while importing a project (e.g. from a hex).
  const [importing, setImporting] = useState(false);

  const untitled = intl.formatMessage({ id: "untitled-project" });

  const refresh = useCallback(async () => {
    const all = await projectsDb.getAllProjectData();
    all.sort(byTimestampDesc);
    setProjects(all);
  }, []);

  const setCurrent = useCallback((id: string | undefined) => {
    setStoredCurrentProjectId(id);
    setCurrentProjectId(id);
  }, []);

  const loadIntoFs = useCallback(
    async (id: string, name: string | undefined, files: Record<string, string>) => {
      await fs.replaceWithMultipleFiles({ files, projectName: name });
      lastSyncedRef.current = { id, name, files };
      setLoadedProjectId(id);
    },
    [fs]
  );

  // Load the project list on mount. Nothing is auto-created: a fresh install
  // shows an empty home page until the user creates or imports a project.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await refresh();
      if (!cancelled) {
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const createProject = useCallback(
    async (name: string) => {
      const id = generateId();
      const files = { ...defaultInitialProject.files };
      await projectsDb.createProject({ id, name, timestamp: Date.now() }, files);
      setCurrent(id);
      await loadIntoFs(id, name, files);
      await refresh();
      postProjectSync({
        type: ProjectSyncMessageType.ReloadProject,
        projectIds: [id],
      });
      return id;
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
      setImporting(true);
      try {
        try {
          await populateFs();
        } catch (e) {
          setLoadedProjectId(undefined);
          setCurrent(undefined);
          throw e;
        }
        const pythonProject = await fs.getPythonProject();
        await projectsDb.createProject(
          {
            id,
            name: pythonProject.projectName ?? name,
            timestamp: Date.now(),
          },
          pythonProject.files
        );
        lastSyncedRef.current = {
          id,
          name: pythonProject.projectName,
          files: pythonProject.files,
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
      const project = await projectsDb.getProject(id);
      if (!project) {
        return false;
      }
      setCurrent(id);
      await loadIntoFs(id, project.meta.name, project.files);
      // Bump recency. Deliberately not broadcast: it must not cause other tabs
      // editing the same project to reload and lose in-flight edits.
      await projectsDb.putProjectData({ ...project.meta, timestamp: Date.now() });
      await refresh();
      return true;
    },
    [loadIntoFs, loadedProjectId, refresh, setCurrent]
  );

  const renameProject = useCallback(
    async (id: string, name: string) => {
      const meta = await projectsDb.getProjectData(id);
      if (!meta) {
        return;
      }
      await projectsDb.putProjectData({ ...meta, name, timestamp: Date.now() });
      if (id === loadedProjectId) {
        await fs.setProjectName(name);
        if (lastSyncedRef.current?.id === id) {
          lastSyncedRef.current.name = name;
        }
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
      const newId = generateId();
      await projectsDb.duplicateProject(id, {
        id: newId,
        name,
        timestamp: Date.now(),
      });
      await refresh();
      postProjectSync({
        type: ProjectSyncMessageType.ReloadProject,
        projectIds: [newId],
      });
      return newId;
    },
    [refresh]
  );

  const deleteProject = useCallback(
    async (id: string) => {
      await projectsDb.deleteProject(id);
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

  // Autosave the currently loaded project back to IndexedDB as it is edited.
  // Only the files that actually changed are written (plus metadata).
  useEffect(() => {
    if (!loadedProjectId) {
      return;
    }
    const save = debounce(async () => {
      const pythonProject = await fs.getPythonProject();
      const prev =
        lastSyncedRef.current?.id === loadedProjectId
          ? lastSyncedRef.current
          : null;
      const prevFiles = prev?.files ?? {};
      const changed: FileRecord[] = [];
      for (const [name, data] of Object.entries(pythonProject.files)) {
        if (prevFiles[name] !== data) {
          changed.push({ projectId: loadedProjectId, name, data });
        }
      }
      const deleted = Object.keys(prevFiles).filter(
        (name) => !(name in pythonProject.files)
      );
      const nameChanged = !prev || prev.name !== pythonProject.projectName;
      if (changed.length === 0 && deleted.length === 0 && !nameChanged) {
        return;
      }
      await projectsDb.saveProject(
        {
          id: loadedProjectId,
          name: pythonProject.projectName ?? prev?.name ?? untitled,
          timestamp: Date.now(),
        },
        changed,
        deleted
      );
      lastSyncedRef.current = {
        id: loadedProjectId,
        name: pythonProject.projectName,
        files: pythonProject.files,
      };
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
        await refresh();
        if (!loadedProjectId || !message.projectIds.includes(loadedProjectId)) {
          return;
        }
        if (message.type === ProjectSyncMessageType.ReloadProject) {
          const project = await projectsDb.getProject(loadedProjectId);
          if (project) {
            // Reloads editor content; dedup ref prevents this echoing back out.
            await loadIntoFs(
              loadedProjectId,
              project.meta.name,
              project.files
            );
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
