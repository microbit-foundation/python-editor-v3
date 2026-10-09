/**
 * What the project cards and toolbar do on the home and projects pages.
 *
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ProjectSummary, useProjectActions } from "@microbit/ui-patterns";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";
import useActionFeedback from "../common/use-action-feedback";
import { useLogging } from "../logging/logging-hooks";
import { useProjectImporter } from "../project/project-hooks";
import { ImportSource } from "../project/project-import";
import { useProjectList, useProjects } from "../project/projects-hooks";
import {
  isQuotaExceededError,
  useShowStorageError,
} from "../project/storage-error-toast";
import { RouterState } from "../router-hooks";
import { createEditorUrl } from "../urls";

/** Which page an action happened on, for analytics. */
export type ProjectSurface = "home" | "projects";

export interface PageProject extends ProjectSummary {
  fileNames: string[];
}

/**
 * Set while a new project is created and the editor opened on it, so the
 * page doesn't show the new card in the moment before it navigates away.
 * Cleared if that doesn't happen, otherwise when the page unmounts: the
 * router commits the editor in a transition after navigate resolves.
 */
let leavingPage = false;
const leavingPageListeners = new Set<() => void>();

const setLeavingPage = (value: boolean) => {
  leavingPage = value;
  leavingPageListeners.forEach((listener) => listener());
};

/** Runs `action`, which resolves true if it navigated away. */
const whileLeavingPage = async (action: () => Promise<boolean>) => {
  setLeavingPage(true);
  let left = false;
  try {
    left = await action();
  } finally {
    if (!left) {
      setLeavingPage(false);
    }
  }
};

const subscribeLeavingPage = (listener: () => void) => {
  leavingPageListeners.add(listener);
  return () => leavingPageListeners.delete(listener);
};

/**
 * The projects as the shared components want them: every one has a name.
 * Held while leaving the page for a new project.
 */
export const usePageProjects = (): PageProject[] => {
  const list = useProjectList();
  const leaving = useSyncExternalStore(subscribeLeavingPage, () => leavingPage);
  const [shownList, setShownList] = useState(list);
  if (!leaving && shownList !== list) {
    setShownList(list);
  }
  useEffect(() => () => setLeavingPage(false), []);
  const intl = useIntl();
  const untitled = intl.formatMessage({ id: "untitled-project" });
  return useMemo(
    () => shownList.map((p) => ({ ...p, name: p.name ?? untitled })),
    [shownList, untitled]
  );
};

/** Runs a storage action, reporting failures as toasts. */
const useAttempt = () => {
  const actionFeedback = useActionFeedback();
  const showStorageError = useShowStorageError();
  return useCallback(
    async (action: () => Promise<void>) => {
      try {
        await action();
      } catch (e) {
        if (isQuotaExceededError(e)) {
          showStorageError(e);
        } else {
          actionFeedback.unexpectedError(e);
        }
      }
    },
    [actionFeedback, showStorageError]
  );
};

/**
 * Creates a project and opens the editor on it, optionally at a
 * documentation tab and anchor.
 */
export const useCreateProject = (surface: ProjectSurface) => {
  const store = useProjects();
  const logging = useLogging();
  const navigate = useNavigate();
  const attempt = useAttempt();
  return useCallback(
    (name: string, state?: RouterState) =>
      attempt(() =>
        whileLeavingPage(async () => {
          logging.event({ type: "project_create", detail: { surface } });
          await store.create(name);
          await navigate(createEditorUrl(state));
          return true;
        })
      ),
    [attempt, logging, navigate, store, surface]
  );
};

export const useProjectPageActions = (
  surface: ProjectSurface,
  projects: PageProject[],
  selectedIds?: string[]
) => {
  const store = useProjects();
  const logging = useLogging();
  const navigate = useNavigate();
  const attempt = useAttempt();
  const create = useCreateProject(surface);

  const actions = useProjectActions({
    projects,
    selectedIds,
    onRename: (id, name) =>
      attempt(async () => {
        logging.event({ type: "project_rename", detail: { surface } });
        await store.rename(id, name);
      }),
    onDuplicate: (id, name) =>
      attempt(async () => {
        logging.event({ type: "project_duplicate", detail: { surface } });
        await store.duplicate(id, name);
      }),
    onDelete: (ids) =>
      attempt(async () => {
        logging.event({
          type: "project_delete",
          detail: { surface, count: ids.length },
        });
        await store.delete(ids);
      }),
  });

  const open = useCallback(
    (id: string) =>
      attempt(async () => {
        logging.event({ type: "project_open", detail: { surface } });
        await store.open(id);
        await navigate(createEditorUrl());
      }),
    [attempt, logging, navigate, store, surface]
  );

  return { actions, open, create };
};

/**
 * Imports files from the home page as a new project and opens the editor on
 * it. Errors are reported as toasts by the importer.
 */
export const useImportProjectFiles = (): ((
  files: File[],
  source: ImportSource
) => Promise<void>) => {
  const importer = useProjectImporter();
  const navigate = useNavigate();
  return useCallback(
    (files: File[], source: ImportSource) =>
      whileLeavingPage(async () => {
        if (await importer.importAsNewProject(files, source)) {
          await navigate(createEditorUrl());
          return true;
        }
        return false;
      }),
    [importer, navigate]
  );
};
