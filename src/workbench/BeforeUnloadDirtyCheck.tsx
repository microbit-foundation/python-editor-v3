/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useEffect } from "react";
import { useFileSystem } from "../fs/fs-hooks";
import { useProjectsDatabaseActive } from "../fs/storage-status";

/**
 * Warns the user before closing a tab if they've made changes that would be
 * lost. Nothing is lost when the project is in the projects database, so the
 * warning only applies to the session-storage fallback and iframe mode.
 */
const BeforeUnloadDirtyCheck = () => {
  const fs = useFileSystem();
  const persisted = useProjectsDatabaseActive();
  useEffect(() => {
    if (persisted) {
      return;
    }
    const listener = (e: BeforeUnloadEvent) => {
      if (fs.dirty) {
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
  }, [fs, persisted]);
  return null;
};

export default BeforeUnloadDirtyCheck;
