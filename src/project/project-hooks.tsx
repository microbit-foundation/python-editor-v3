import { Text } from "@codemirror/state";
import { useCallback, useEffect, useMemo, useState } from "react";
import useActionFeedback from "../common/use-action-feedback";
import useIsUnmounted from "../common/use-is-unmounted";
import { useDevice } from "../device/device-hooks";
import { EVENT_STATE, Project } from "../fs/fs";
import { useFileSystem } from "../fs/fs-hooks";
import { ProjectActions } from "./project-actions";

/**
 * Hook exposing the main UI actions.
 */
export const useProjectActions = (): ProjectActions => {
  const fs = useFileSystem();
  const actionFeedback = useActionFeedback();
  const device = useDevice();
  const actions = useMemo<ProjectActions>(
    () => new ProjectActions(fs, device, actionFeedback),
    [fs, device, actionFeedback]
  );
  return actions;
};

/**
 * Hook exposing the project state.
 * 
 * This is quite coarse-grained and might need to be split in future.
 */
export const useProject = (): Project => {
  const fs = useFileSystem();
  const isUnmounted = useIsUnmounted();
  const [state, setState] = useState<Project>(fs.state);
  useEffect(() => {
    const listener = (x: any) => {
      if (!isUnmounted()) {
        setState(x);
      }
    };
    fs.on(EVENT_STATE, listener);
    return () => {
      fs.removeListener(EVENT_STATE, listener);
    };
  }, [fs, isUnmounted]);
  return state;
};


/**
 * Reads an initial value from the project file system and synchronises back to it.
 */
export const useProjectFileText = (
  filename: string
): [Text | undefined, (text: Text) => void] => {
  const fs = useFileSystem();
  const [initialValue, setInitialValue] = useState<Text | undefined>();

  useEffect(() => {
    const string = fs.read(filename);
    setInitialValue(Text.of(string.split("\n")));
  }, [fs, filename]);

  const handleChange = useCallback(
    (text: Text) => {
      const content = text.sliceString(0, undefined, "\n");
      // If we fill up the FS it seems to cope and error when we
      // ask for a hex.
      fs.write(filename, content);
    },
    [fs, filename]
  );

  return [initialValue, handleChange];
};
