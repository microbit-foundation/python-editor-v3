/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { isMakeCodeForV1Hex } from "@microbit/microbit-universal-hex";
import { useCallback } from "react";
import { useIntl } from "react-intl";
import useActionFeedback from "../common/use-action-feedback";
import { useFileSystem } from "../fs/fs-hooks";
import { getLowercaseFileExtension, readFileAsText } from "../fs/fs-util";
import { router } from "../router";
import { createEditorUrl } from "../urls";
import { LoadType } from "./project-actions";
import { useProjectActions } from "./project-hooks";
import { useProjects } from "./projects-hooks";

const isMakeCodeHex = (hex: string): boolean => {
  try {
    return isMakeCodeForV1Hex(hex);
  } catch {
    return false;
  }
};

/**
 * Returns a handler that imports dropped/selected files.
 *
 * A single hex file becomes a brand new project (leaving the currently open
 * project untouched) and we navigate to the editor. Other files fall back to
 * the existing load-into-current-project behaviour.
 */
export const useImportProject = () => {
  const intl = useIntl();
  const fs = useFileSystem();
  const actions = useProjectActions();
  const actionFeedback = useActionFeedback();
  const { importProject } = useProjects();

  return useCallback(
    async (files: File[], loadType: LoadType = "file-upload") => {
      if (files.length === 0) {
        return;
      }
      const isSingleHex =
        files.length === 1 &&
        getLowercaseFileExtension(files[0].name) === "hex";
      if (!isSingleHex) {
        // Non-hex files keep the existing behaviour (load into the open project).
        void actions.load(files, loadType);
        return;
      }

      // A hex creates a new project from its contents. Importing in a single
      // file-system step (behind the loading overlay) avoids showing the
      // previous project, then a default project, then the imported one.
      const file = files[0];
      const projectName = file.name.replace(/\.hex$/i, "");
      const hex = await readFileAsText(file);
      try {
        await importProject(projectName, () =>
          fs.replaceWithHexContents(projectName, hex)
        );
        void router.navigate(createEditorUrl());
        actionFeedback.success({
          title: intl.formatMessage({ id: "project-loaded" }),
        });
      } catch (e: any) {
        actionFeedback.expectedError({
          title: intl.formatMessage(
            { id: "load-error-title" },
            { fileCount: 1 }
          ),
          description: isMakeCodeHex(hex)
            ? intl.formatMessage({ id: "load-error-makecode-info" })
            : e.message,
        });
      }
    },
    [actionFeedback, actions, fs, importProject, intl]
  );
};
