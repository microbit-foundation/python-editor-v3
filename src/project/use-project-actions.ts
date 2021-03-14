import { useMemo } from "react";
import useActionFeedback from "../common/use-action-feedback";
import { useFileSystem } from "../fs/fs-hooks";
import {
  getFileExtension,
  isPythonMicrobitModule,
  readFileAsText,
} from "../fs/fs-util";
import translation from "../translation";

const errorTitle = "Cannot load file";

interface ProjectActions {
  open(file: File): Promise<void>;
}

export const useProjectActions = (): ProjectActions => {
  const fs = useFileSystem();
  const actionFeedback = useActionFeedback();
  const actions = useMemo<ProjectActions>(
    () => ({
      open: async (file: File) => {
        const extension = getFileExtension(file.name)?.toLowerCase();
        if (extension === "py") {
          const code = await readFileAsText(file);
          if (!code) {
            actionFeedback.expectedError({
              title: errorTitle,
              description: "The file was empty.",
            });
          } else if (isPythonMicrobitModule(code)) {
            const exists = fs.exists(file.name);
            const change = exists ? "Updated" : "Added";
            fs.addOrUpdateFile(file.name, code);
            actionFeedback.success({
              title: `${change} module ${file.name}`,
            });
          } else {
            fs.replaceWithMainContents(code);
            actionFeedback.success({
              title: "Loaded " + file.name,
            });
          }
        } else if (extension === "hex") {
          const hex = await readFileAsText(file);
          await fs.replaceWithHexContents(hex);
          actionFeedback.success({
            title: "Loaded " + file.name,
          });
        } else if (extension === "mpy") {
          actionFeedback.warning({
            title: errorTitle,
            description: translation.load["mpy-warning"],
          });
        } else {
          actionFeedback.warning({
            title: errorTitle,
            description: translation.load["extension-warning"],
          });
        }
      },
    }),
    [actionFeedback, fs]
  );
  return actions;
};
