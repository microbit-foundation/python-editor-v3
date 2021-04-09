import { useEffect } from "react";
import { useFileSystem } from "../fs/fs-hooks";
import translation from "../translation";

/**
 * Warns the user before closing a tab if they've made changes.
 */
const BeforeUnloadDirtyCheck = () => {
  const fs = useFileSystem();
  useEffect(() => {
    const listener = (e: BeforeUnloadEvent) => {
      if (fs.dirty) {
        e.preventDefault();
        e.returnValue = translation.confirms.quit;
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
