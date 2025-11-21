import { useContext } from "react";
import { ProjectStorageContext } from "./ProjectStorageProvider";
import * as Y from "yjs";
import { Awareness } from "y-protocols/awareness.js";

interface PersistentProjectActions {
  ydoc?: Y.Doc;
  awareness?: Awareness;
  projectId?: string;
}

export const usePersistentProject = (): PersistentProjectActions => {

  const ctx = useContext(ProjectStorageContext);
  if (!ctx)
    throw new Error(
      "usePersistentProject must be used within a ProjectStorageProvider"
    );
  return {
    ydoc: ctx.projectStore?.ydoc,
    awareness: ctx.projectStore?.awareness,
    projectId: ctx.projectStore?.projectId
  };
}
