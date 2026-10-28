/**
 * What the project cards and toolbar do on the home and projects pages.
 *
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ProjectSummary, useProjectActions } from "@microbit/ui-patterns";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import {
  ActionFunctionArgs,
  redirect,
  useFetcher,
  useFetchers,
  useNavigate,
  useNavigation,
} from "react-router";
import useActionFeedback from "../common/use-action-feedback";
import { MAIN_FILE } from "../fs/fs";
import { useLogging } from "../logging/logging-hooks";
import { useProjectImporter } from "../project/project-hooks";
import { ImportSource } from "../project/project-import";
import { Projects } from "../project/projects";
import { useProjectList, useProjects } from "../project/projects-hooks";
import {
  isQuotaExceededError,
  useShowStorageError,
} from "../project/storage-error-toast";
import { RouterState } from "../router-hooks";
import { createEditorUrl, routerPathFromUrl } from "../urls";

/** Which page an action happened on, for analytics. */
export type ProjectSurface = "home" | "projects";

export interface PageProject extends ProjectSummary {
  fileNames: string[];
}

/** Shared by every create, so pages can see one in progress. */
const createProjectFetcherKey = "create-project";

/** The editor route's action result when creating a project fails. */
interface CreateProjectFailure {
  error: unknown;
}

/** What the editor route's action reads from its form. */
interface CreateProjectFields {
  name: string;
  /** An idea's program for main.py, with the idea's slug. */
  idea?: { code: string; slug: string };
}

/**
 * The editor route's action: creates a project from the form and opens the
 * editor on it at the same URL. Part of the navigation, so the router knows
 * a create is in progress until the editor is showing.
 */
export const createProjectAction =
  (projects: Projects) =>
  async ({
    request,
  }: ActionFunctionArgs): Promise<Response | CreateProjectFailure> => {
    const form = await request.formData();
    const field = (key: string) => {
      const value = form.get(key);
      return typeof value === "string" ? value : undefined;
    };
    const name = field("name") ?? "";
    const code = field("code");
    const ideaSlug = field("ideaSlug");
    try {
      if (code !== undefined && ideaSlug !== undefined) {
        await projects.createFromFiles(
          name,
          { [MAIN_FILE]: new TextEncoder().encode(code) },
          ideaSlug
        );
      } else {
        await projects.create(name);
      }
    } catch (error) {
      return { error };
    }
    return redirect(routerPathFromUrl(request.url));
  };

/**
 * The projects as the shared components want them: every one has a name.
 * Held while a create is in progress, so the new card doesn't show in the
 * moment before the page gives way to the editor.
 */
export const usePageProjects = (): PageProject[] => {
  const list = useProjectList();
  const creating = useFetchers().some(
    (f) => f.key === createProjectFetcherKey && f.state !== "idle"
  );
  const navigating = useNavigation().state !== "idle";
  const [shownList, setShownList] = useState(list);
  if (!creating && !navigating && shownList !== list) {
    setShownList(list);
  }
  const intl = useIntl();
  const untitled = intl.formatMessage({ id: "untitled-project" });
  return useMemo(
    () => shownList.map((p) => ({ ...p, name: p.name ?? untitled })),
    [shownList, untitled]
  );
};

/** Reports a failed storage action as a toast. */
const useReportError = () => {
  const actionFeedback = useActionFeedback();
  const showStorageError = useShowStorageError();
  return useCallback(
    (e: unknown) => {
      if (isQuotaExceededError(e)) {
        showStorageError(e);
      } else {
        actionFeedback.unexpectedError(e);
      }
    },
    [actionFeedback, showStorageError]
  );
};

/** Runs a storage action, reporting failures as toasts. */
const useAttempt = () => {
  const reportError = useReportError();
  return useCallback(
    async (action: () => Promise<void>) => {
      try {
        await action();
      } catch (e) {
        reportError(e);
      }
    },
    [reportError]
  );
};

/**
 * Creates a project and opens the editor on it, optionally at a
 * documentation tab and anchor. Goes through the editor route's action
 * (createProjectAction).
 */
export const useCreateProject = (surface: ProjectSurface) => {
  const logging = useLogging();
  const submit = useSubmitCreateProject();
  return useCallback(
    async (name: string, state?: RouterState) => {
      logging.event({ type: "project_create", detail: { surface } });
      await submit({ name }, state);
    },
    [logging, submit, surface]
  );
};

/**
 * Opens an idea as a new project with its program in main.py, showing its
 * guide beside the editor.
 */
export const useOpenIdea = () => {
  const logging = useLogging();
  const submit = useSubmitCreateProject();
  return useCallback(
    async (name: string, slug: string, code: string) => {
      logging.event({ type: "idea_open", detail: { id: slug } });
      await submit({ name, idea: { code, slug } }, { tab: "guide" });
    },
    [logging, submit]
  );
};

/**
 * Submits to the editor route's action (createProjectAction), reporting a
 * failure as a toast.
 */
const useSubmitCreateProject = () => {
  const reportError = useReportError();
  const fetcher = useFetcher<CreateProjectFailure>({
    key: createProjectFetcherKey,
  });
  const failure = fetcher.data;
  useEffect(() => {
    if (failure) {
      reportError(failure.error);
    }
  }, [failure, reportError]);
  const { submit } = fetcher;
  return useCallback(
    (fields: CreateProjectFields, state?: RouterState) =>
      submit(
        {
          name: fields.name,
          ...(fields.idea && {
            code: fields.idea.code,
            ideaSlug: fields.idea.slug,
          }),
        },
        { method: "post", action: createEditorUrl(state) }
      ),
    [submit]
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
    async (files: File[], source: ImportSource) => {
      if (await importer.importAsNewProject(files, source)) {
        await navigate(createEditorUrl());
      }
    },
    [importer, navigate]
  );
};
