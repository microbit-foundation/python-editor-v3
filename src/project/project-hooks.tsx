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
import {
  EVENT_SERIAL_DATA,
  EVENT_SERIAL_ERROR,
  EVENT_SERIAL_RESET,
} from "../device/device";
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

interface Traceback {
  error: string;
  trace: string[];
}

export class TracebackScrollback {
  private scrollback: string = "";
  push(data: string) {
    this.scrollback = this.scrollback + data;
    const limit = 4096;
    if (this.scrollback.length > limit) {
      this.scrollback = this.scrollback.slice(data.length - limit);
    }
    const lines = this.scrollback.split("\r\n");
    for (let i = lines.length - 1; i >= 0; --i) {
      if (lines[i].startsWith("Traceback (most recent call last):")) {
        // Start of last traceback
        // Skip all following lines with an indent and grab the first one without, which is the error message.
        let endOfIndent = i + 1;
        while (
          endOfIndent < lines.length &&
          lines[endOfIndent].startsWith("  ")
        ) {
          endOfIndent++;
        }
        if (endOfIndent < lines.length) {
          const trace = lines
            .slice(i + 1, endOfIndent)
            .map((line) => line.trim());
          const error = lines[endOfIndent];
          return { error, trace };
        }
        return undefined;
      }
    }
    return undefined;
  }
  clear() {
    this.scrollback = "";
  }
}

export const useDeviceTraceback = () => {
  const device = useDevice();
  const [runtimeError, setRuntimeError] = useState<Traceback | undefined>(
    undefined
  );

  useEffect(() => {
    const buffer = new TracebackScrollback();
    const dataListener = (data: string) => {
      setRuntimeError(buffer.push(data));
    };
    const clearListener = () => {
      buffer.clear();
      setRuntimeError(undefined);
    };
    device.addListener(EVENT_SERIAL_DATA, dataListener);
    device.addListener(EVENT_SERIAL_RESET, clearListener);
    device.addListener(EVENT_SERIAL_ERROR, clearListener);
    return () => {
      device.removeListener(EVENT_SERIAL_ERROR, clearListener);
      device.removeListener(EVENT_SERIAL_RESET, clearListener);
      device.removeListener(EVENT_SERIAL_DATA, dataListener);
    };
  }, [device, setRuntimeError]);

  return runtimeError;
};
