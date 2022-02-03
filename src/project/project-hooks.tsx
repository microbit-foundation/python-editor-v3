/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import useActionFeedback from "../common/use-action-feedback";
import { useDialogs } from "../common/use-dialogs";
import useIsUnmounted from "../common/use-is-unmounted";
import { useDevice } from "../device/device-hooks";
import { EVENT_PROJECT_UPDATED, Project, VersionAction } from "../fs/fs";
import { useFileSystem } from "../fs/fs-hooks";
import { useLogging } from "../logging/logging-hooks";
import { useSelection } from "../workbench/use-selection";
import { ProjectActions } from "./project-actions";
import { useLanguageServerClient } from "../language-server/language-server-hooks";

/**
 * Hook exposing the main UI actions.
 */
export const useProjectActions = (): ProjectActions => {
  const fs = useFileSystem();
  const actionFeedback = useActionFeedback();
  const device = useDevice();
  const dialogs = useDialogs();
  const [, setSelection] = useSelection();
  const logging = useLogging();
  const intl = useIntl();
  const client = useLanguageServerClient();
  const actions = useMemo<ProjectActions>(
    () =>
      new ProjectActions(
        fs,
        device,
        actionFeedback,
        dialogs,
        setSelection,
        intl,
        logging,
        client
      ),
    [fs, device, actionFeedback, dialogs, setSelection, intl, logging, client]
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
): [string | undefined, (text: string) => void] => {
  const fs = useFileSystem();
  const actionFeedback = useActionFeedback();
  const [initialValue, setInitialValue] = useState<string | undefined>();
  const isUnmounted = useIsUnmounted();
  useEffect(() => {
    const loadData = async () => {
      try {
        if (await fs.exists(filename)) {
          const { data } = await fs.read(filename);
          const text = new TextDecoder().decode(data);
          if (!isUnmounted()) {
            setInitialValue(text);
          }
        }
      } catch (e) {
        actionFeedback.unexpectedError(e);
      }
    };

    loadData();
  }, [fs, filename, actionFeedback, isUnmounted]);

  const handleChange = useCallback(
    (content: string) => {
      try {
        fs.write(filename, content, VersionAction.MAINTAIN);
      } catch (e) {
        actionFeedback.unexpectedError(e);
      }
    },
    [fs, filename, actionFeedback]
  );

  return [initialValue, handleChange];
};
