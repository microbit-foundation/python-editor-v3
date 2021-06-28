/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useEffect } from "react";
import { useFileSystem } from "../fs/fs-hooks";

/**
 * Warns the user before closing a tab if they've made changes.
 */
const BeforeUnloadDirtyCheck = () => {
  const fs = useFileSystem();
  useEffect(() => {
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
  }, [fs]);
  return null;
};

export default BeforeUnloadDirtyCheck;
