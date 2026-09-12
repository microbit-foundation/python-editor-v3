/**
 * What the project cards and toolbar do on the home and projects pages.
 *
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ProjectSummary, useProjectActions } from "@microbit/ui-patterns";
import { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";
import useActionFeedback from "../common/use-action-feedback";
import { useLogging } from "../logging/logging-hooks";
import { useProjectList, useProjects } from "../project/projects-hooks";
import { createEditorUrl } from "../urls";

/** Which page an action happened on, for analytics. */
export type ProjectSurface = "home" | "projects";

export interface PageProject extends ProjectSummary {
  fileNames: string[];
}

/**
 * The projects as the shared components want them: every one has a name.
 */
export const usePageProjects = (): PageProject[] => {
  const list = useProjectList();
  const intl = useIntl();
  const untitled = intl.formatMessage({ id: "untitled-project" });
  return useMemo(
    () => list.map((p) => ({ ...p, name: p.name ?? untitled })),
    [list, untitled]
  );
};

export const useProjectPageActions = (
  surface: ProjectSurface,
  projects: PageProject[],
  getSelectedIds?: () => string[]
) => {
  const store = useProjects();
  const logging = useLogging();
  const navigate = useNavigate();
  const actionFeedback = useActionFeedback();

  const attempt = useCallback(
    async (action: () => Promise<void>) => {
      try {
        await action();
      } catch (e) {
        actionFeedback.unexpectedError(e);
      }
    },
    [actionFeedback]
  );

  const actions = useProjectActions({
    projects,
    getSelectedIds,
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

  const create = useCallback(
    (name: string) =>
      attempt(async () => {
        logging.event({ type: "project_create", detail: { surface } });
        await store.create(name);
        await navigate(createEditorUrl());
      }),
    [attempt, logging, navigate, store, surface]
  );

  return { actions, open, create };
};
