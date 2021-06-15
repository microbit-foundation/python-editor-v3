import { useEffect } from "react";
import { useIntl } from "react-intl";
import { useFileSystem } from "../fs/fs-hooks";

/**
 * Warns the user before closing a tab if they've made changes.
 */
const BeforeUnloadDirtyCheck = () => {
  const fs = useFileSystem();
  const intl = useIntl();
  useEffect(() => {
    const listener = (e: BeforeUnloadEvent) => {
      if (fs.dirty) {
        e.preventDefault();
        // Modern browsers don't show this text to users due to abuse.
        e.returnValue = intl.formatMessage({ id: "quit-anyway" });
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
