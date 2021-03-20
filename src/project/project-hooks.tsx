import { Text } from "@codemirror/state";
import { useCallback, useEffect, useMemo, useState } from "react";
import useActionFeedback from "../common/use-action-feedback";
import useIsUnmounted from "../common/use-is-unmounted";
import { useDevice } from "../device/device-hooks";
import { EVENT_PROJECT_UPDATED, Project } from "../fs/fs";
import { useFileSystem } from "../fs/fs-hooks";
import { VersionAction } from "../fs/storage";
import { useLogging } from "../logging/logging-hooks";
import { ProjectActions } from "./project-actions";

/**
 * Hook exposing the main UI actions.
 */
export const useProjectActions = (): ProjectActions => {
  const fs = useFileSystem();
  const actionFeedback = useActionFeedback();
  const device = useDevice();
  const logging = useLogging();
  const actions = useMemo<ProjectActions>(
    () => new ProjectActions(fs, device, actionFeedback, logging),
    [fs, device, actionFeedback, logging]
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
  const [state, setState] = useState<Project>(fs.project);
  useEffect(() => {
    const listener = (x: any) => {
      if (!isUnmounted()) {
        setState(x);
      }
    };
    fs.on(EVENT_PROJECT_UPDATED, listener);
    return () => {
      fs.removeListener(EVENT_PROJECT_UPDATED, listener);
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
  const actionFeedback = useActionFeedback();
  const [initialValue, setInitialValue] = useState<Text | undefined>();

  useEffect(() => {
    const loadData = async () => {
      try {
        if (await fs.exists(filename)) {
          const { data } = await fs.read(filename);
          // If this fails we should return an error.
          const text = new TextDecoder().decode(data);
          setInitialValue(Text.of(text.split("\n")));
        }
      } catch (e) {
        actionFeedback.unexpectedError(e);
      }
    };

    loadData();
  }, [fs, filename, actionFeedback]);

  const handleChange = useCallback(
    (text: Text) => {
      const content = text.sliceString(0, undefined, "\n");
      fs.write(filename, content, VersionAction.MAINTAIN);
    },
    [fs, filename]
  );

  return [initialValue, handleChange];
};
