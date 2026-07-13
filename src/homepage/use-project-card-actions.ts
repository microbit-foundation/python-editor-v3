/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { createElement, useCallback } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";
import { ConfirmDialog } from "../common/ConfirmDialog";
import {
  InputDialog,
  InputDialogBody,
  InputValidationResult,
} from "../common/InputDialog";
import { useDialogs } from "../common/use-dialogs";
import { useLogging } from "../logging/logging-hooks";
import { useProjects } from "../project/projects-hooks";
import { createEditorUrl } from "../urls";
import ProjectNameBody from "./ProjectNameBody";
import { ProjectNameDialogReason } from "./project-name";

export type ProjectActionSurface = "home" | "projects";

const validateName = (value: string): InputValidationResult =>
  value.trim().length > 0 ? { ok: true } : { ok: false };

/**
 * Shared project card action handlers (create / open / rename / duplicate /
 * delete) used by the home page and projects page.
 */
export const useProjectCardActions = (surface: ProjectActionSurface) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const dialogs = useDialogs();
  const logging = useLogging();
  const {
    projects,
    createProject,
    openProject,
    renameProject,
    duplicateProject,
    deleteProject,
  } = useProjects();

  const chooseName = useCallback(
    (initialValue: string, headerId: string, actionId: string) =>
      dialogs.show<string | undefined>((callback) =>
        createElement(InputDialog<string>, {
          header: createElement(FormattedMessage, { id: headerId }),
          Body: ProjectNameBody as React.FC<InputDialogBody<string>>,
          initialValue,
          actionLabel: intl.formatMessage({ id: actionId }),
          validate: validateName,
          callback,
        })
      ),
    [dialogs, intl]
  );

  const handleCreate = useCallback(async () => {
    const name = await chooseName(
      intl.formatMessage({ id: "untitled-project" }),
      "create-project-dialog-heading",
      "create-project-action"
    );
    if (name) {
      logging.event({ type: "project-create", detail: { surface } });
      await createProject(name.trim());
      navigate(createEditorUrl());
    }
  }, [chooseName, createProject, intl, logging, navigate, surface]);

  const handleOpen = useCallback(
    async (id: string) => {
      logging.event({ type: "project-open", detail: { surface } });
      await openProject(id);
      navigate(createEditorUrl());
    },
    [logging, navigate, openProject, surface]
  );

  const handleRenameDuplicate = useCallback(
    async (reason: ProjectNameDialogReason, id: string) => {
      const project = projects.find((p) => p.id === id);
      if (!project) {
        return;
      }
      const name = await chooseName(
        project.name,
        reason === "rename"
          ? "rename-project-heading"
          : "duplicate-project-heading",
        reason === "rename"
          ? "rename-project-action"
          : "duplicate-project-action"
      );
      if (name) {
        if (reason === "rename") {
          logging.event({ type: "project-rename", detail: { surface } });
          await renameProject(id, name.trim());
        } else {
          logging.event({ type: "project-duplicate", detail: { surface } });
          await duplicateProject(id, name.trim());
        }
      }
    },
    [chooseName, duplicateProject, logging, projects, renameProject, surface]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      const project = projects.find((p) => p.id === id);
      if (!project) {
        return;
      }
      const confirmed = await dialogs.show<boolean>((callback) =>
        createElement(ConfirmDialog, {
          header: intl.formatMessage({ id: "delete-project-confirm-heading" }),
          body: createElement(FormattedMessage, {
            id: "delete-project-confirm-text",
            values: { project: project.name },
          }),
          actionLabel: intl.formatMessage({ id: "delete-project-action" }),
          callback,
        })
      );
      if (confirmed) {
        logging.event({ type: "project-delete", detail: { surface } });
        await deleteProject(id);
      }
    },
    [deleteProject, dialogs, intl, logging, projects, surface]
  );

  const handleDeleteMany = useCallback(
    async (ids: string[]) => {
      if (ids.length === 0) {
        return;
      }
      if (ids.length === 1) {
        return handleDelete(ids[0]);
      }
      const confirmed = await dialogs.show<boolean>((callback) =>
        createElement(ConfirmDialog, {
          header: intl.formatMessage({ id: "delete-projects-confirm-heading" }),
          body: createElement(FormattedMessage, {
            id: "delete-projects-confirm-text",
            values: { numProjects: ids.length },
          }),
          actionLabel: intl.formatMessage({ id: "delete-project-action" }),
          callback,
        })
      );
      if (confirmed) {
        logging.event({
          type: "project-delete",
          detail: { surface, count: ids.length },
        });
        for (const id of ids) {
          await deleteProject(id);
        }
      }
    },
    [deleteProject, dialogs, handleDelete, intl, logging, surface]
  );

  return {
    handleCreate,
    handleOpen,
    handleRenameDuplicate,
    handleDelete,
    handleDeleteMany,
  };
};
