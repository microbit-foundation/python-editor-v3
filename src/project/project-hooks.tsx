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
import { EVENT_SERIAL_DATA, EVENT_SERIAL_RESET } from "../device/device";
import { useDevice } from "../device/device-hooks";
import { EVENT_PROJECT_UPDATED, Project, VersionAction } from "../fs/fs";
import { useFileSystem } from "../fs/fs-hooks";
import { useLogging } from "../logging/logging-hooks";
import { useSelection } from "../workbench/use-selection";
import { ProjectActions } from "./project-actions";

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
  const actions = useMemo<ProjectActions>(
    () =>
      new ProjectActions(
        fs,
        device,
        actionFeedback,
        dialogs,
        setSelection,
        intl,
        logging
      ),
    [fs, device, actionFeedback, dialogs, setSelection, intl, logging]
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

export class TracebackScrollback {
  private data: string = "";
  push(data: string) {
    this.data = this.data += data;
    const limit = 4096;
    if (this.data.length > limit) {
      this.data = this.data.slice(data.length - limit);
    }
  }
  lastTraceback(): string | undefined {
    // Traceback (most recent call last):
    //   Indented lines showing stack
    // NameOfException: str(Exception)
    // MicroPython v1.15-64-g1e2f0d280
    const tracebacks = this.data.match(
      /^Traceback.*$(\r\n^\s+.*)+\r\n^(\w+:.*$)/gm
    );
    if (tracebacks) {
      const last = tracebacks[tracebacks.length - 1];
      return last;
    }
    return undefined;
  }
}

export const useRuntimeError = () => {
  const device = useDevice();
  const [runtimeError, setRuntimeError] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    const buffer = new TracebackScrollback();
    const dataListener = (data: string) => {
      buffer.push(data);
      setRuntimeError(buffer.lastTraceback());
    };
    const clearListener = () => {
      setRuntimeError(undefined);
    };
    device.addListener(EVENT_SERIAL_DATA, dataListener);
    device.addListener(EVENT_SERIAL_RESET, clearListener);
    device.addListener(EVENT_SERIAL_DATA, clearListener);
    return () => {
      device.removeListener(EVENT_SERIAL_DATA, clearListener);
      device.removeListener(EVENT_SERIAL_RESET, clearListener);
      device.removeListener(EVENT_SERIAL_DATA, dataListener);
    };
  }, [device, setRuntimeError]);

  return runtimeError;
};
