/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useEffect } from "react";
import { useFileSystem } from "../fs/fs-hooks";
import { useProjectsDatabaseActive } from "../fs/storage-status";
import { useProjectsIfAvailable } from "../project/projects-hooks";

/**
 * Warns the user before closing a tab if they've made changes that would be
 * lost.
 *
 * With the projects database, edits are saved as they are made, so the only
 * ones at risk are those that failed to save. With the session-storage
 * fallback and in iframe mode, anything since the last hex save is.
 */
const BeforeUnloadDirtyCheck = () => {
  const fs = useFileSystem();
  const projects = useProjectsIfAvailable();
  const persisted = useProjectsDatabaseActive();
  useEffect(() => {
    const listener = (e: BeforeUnloadEvent) => {
      const atRisk = persisted ? projects?.hasUnsavedChanges : fs.dirty;
      if (atRisk) {
        e.preventDefault();
        // Modern browsers don't show this text to users due to abuse.
        e.returnValue =
          "Some of your changes have not been saved. Quit anyway?";
      }
    };
    window.addEventListener("beforeunload", listener);
    return () => {
      window.removeEventListener("beforeunload", listener);
    };
  }, [fs, persisted, projects]);
  return null;
};

export default BeforeUnloadDirtyCheck;
