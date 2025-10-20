// ProjectContext.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";
import { Awareness } from "y-protocols/awareness";
import { useProjectActions } from "../project/project-hooks";
import { withProjectDb } from "./project-list-db";

interface ProjectContextValue {
  projectId: string;
  projectList: ProjectList | null;
  ydoc: Y.Doc | null;
  awareness: Awareness | null;
  getFile: (filename: string) => Y.Text | null;
  setProjectById: (id: string) => void;
}

const ProjectStorageContext = createContext<ProjectContextValue | null>(null);

type ProjectEntry = { projectName: string; id: string };
type ProjectList = [ProjectEntry];

export function ProjectStorageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [projectList, setProjectList] = useState<ProjectList | null>(null);
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  const awareness = useMemo(() => (ydoc ? new Awareness(ydoc) : null), [ydoc]);
  const clientId = useMemo(() => `${Math.random()}`, []);
  const [projectId, setProjectById] = useState<string>("yjs-store");
  const pa = useProjectActions();

  // Set up addProject hook to add a known project to the list if it does not exist
  const newProject: () => Promise<string> = useCallback(async () => {
    const newProjectId = makeUID();
    await withProjectDb("readwrite", async (store) => {
      store.add({ id: newProjectId, projectName: "Untitled project" });
      return Promise.resolve();
    });
    setProjectById(newProjectId);
    return newProjectId;
  }, []);

  // TODO: Get rid of debug hooks
  (window as unknown as any).projectList = projectList;
  (window as unknown as any).newProject = newProject;
  (window as unknown as any).setProjectById = setProjectById;

  useEffect(() => {
    const getProjectsAsync = async () => {
      const projectList = await withProjectDb("readonly", async (store) => {
        const projectList = await new Promise((res, rej) => {
          const query = store.getAll();
          query.onsuccess = () => res(query.result);
          query.onerror = rej;
        });
        return projectList;
      });
      setProjectList(projectList as ProjectList);
    };
    void getProjectsAsync();
  });

  // Y.Doc works synchronously, but the persistence and broadcast channel will need cleanup
  useEffect(() => {
    let ydoc: Y.Doc;
    let broadcastHandler: (e: MessageEvent<any>) => void;
    let persistence: IndexeddbPersistence;

    const updates = new BroadcastChannel("yjs");
    const updatePoster = (update: Uint8Array) => {
      updates.postMessage({ clientId, update });
    };

    const initializeYDoc = async () => {
      ydoc = new Y.Doc();
      persistence = new IndexeddbPersistence(projectId, ydoc);
      ydoc.on("update", updatePoster);

      broadcastHandler = ({ data }: MessageEvent<any>) => {
        if (data.clientId !== clientId) {
          Y.applyUpdate(ydoc, data.update);
        }
      };

      updates.addEventListener("message", broadcastHandler);

      await new Promise((res) => persistence.once("synced", res));

      migrate(ydoc);

      let files = {} as Record<string, string>;
      for (const filename of ydoc.getMap("files").keys()) {
        const contents = (
          ydoc.getMap("files").get(filename) as Y.Text
        ).toString();
        files[filename] = contents;
      }
      pa.openProjectPlaintext({
        files,
        projectName: ydoc.getMap("meta").get("projectName") as string,
      });
      setYdoc(ydoc);
    };
    void initializeYDoc();
    return () => {
      ydoc.off("update", updatePoster);
      updates.removeEventListener("message", broadcastHandler);
      updates.close();
      void persistence.destroy();
    };
  }, [projectId]);

  // Helper to access files
  const getFile = (filename: string) => {
    if (!ydoc) {
      return null;
    }
    const files = ydoc.getMap<Y.Text>("files");
    if (!files.has(filename)) files.set(filename, new Y.Text());
    return files.get(filename)!;
  };

  return (
    <ProjectStorageContext.Provider
      value={{
        ydoc,
        projectId,
        projectList,
        awareness,
        getFile,
        setProjectById,
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

const migrate = (doc: Y.Doc) => {
  const meta = doc.getMap("meta");
  if (!meta.has("version")) {
    // TODO: migrate from session store.
    // This could be a per-app handler
    meta.set("version", 1);
    meta.set("projectName", "default"); // TODO: get this from the last loaded project name
  }
};

// TODO: WORLDS UGLIEST UIDS
const makeUID = () => {
  return `${Math.random()}`;
};

