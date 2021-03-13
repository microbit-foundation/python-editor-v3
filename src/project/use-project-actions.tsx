import { useMemo } from "react";
import useActionFeedback from "../common/use-action-feedback";
import { useDevice } from "../device/device-hooks";
import { useFileSystem } from "../fs/fs-hooks";
import { ProjectActions } from "./project-actions";

/**
 * Hook exposing the main UI actions.
 */
export const useProjectActions = (): ProjectActions => {
  const fs = useFileSystem();
  const actionFeedback = useActionFeedback();
  const device = useDevice();
  const actions = useMemo<ProjectActions>(
    () => new ProjectActions(fs, device, actionFeedback),
    [fs, device, actionFeedback]
  );
  return actions;
};
